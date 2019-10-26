const {TeamSpeak, QueryProtocol} = require("ts3-nodejs-library");
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config({path: '.env'});

let connection = TeamSpeak.connect({
    host: process.env.HOST,
    protocol: QueryProtocol.RAW,
    queryport: 10011,
    serverport: 9987,
    username: 'serveradmin',
    password: process.env.PASSWORD,
    nickname: 'Le Bot'
});

function getUserMappings() {
    return JSON.parse(fs.readFileSync('config/userMappings.json', 'utf-8'));
}

async function ts3Sync(teams) {
    const result = [];
    const userMappings = getUserMappings();
    const ts3 = await connection;
    const channels = await ts3.channelList();
    const scrambleChannel = channels.reduce((c1, c2) => c1.totalClients > c2.totalClients ? c1 : c2);
    const otherChannel = channels.filter(c => c.neededTalkPower === 0).find(c => c.totalClients === 0);
    const clients = await ts3.clientList({client_type: 0, cid: scrambleChannel.cid});

    if (!scrambleChannel || !otherChannel || scrambleChannel === otherChannel) {
        throw new Error('Could not determine channels for scrambling')
    }

    for (const client of clients) {
        const userMapping = userMappings.find(u => u.ts3Id === client.uniqueIdentifier);
        if (!userMapping) {
            //todo smarter (1 missing is ok, maybe also try to match by nickname)
            throw new Error(`No mapping for user ${client.nickname}`);
        }

        const team = teams.find(t => userMapping.ids.includes(t.id));
        if (!team) {
            throw new Error(`Could not determine team for ${client.nickname}`)
        }

        const res = {
            nickname: client.nickname,
            ts3Id: client.uniqueIdentifier,
            channelName: scrambleChannel.name,
            channelId: scrambleChannel.cid,
            moved: false, ...team
        };

        if (team.team === 2) {
            res.channelName = otherChannel.name;
            res.channelId = otherChannel.cid;
            res.moved = true;
            await client.move(otherChannel.cid);
        }

        result.push(res);
    }

    return result;
}

async function monitorUsers() {
    try {
        const userMappings = getUserMappings();
        const ts3 = await connection;
        const clients = await ts3.clientList({client_type: 0});
        for (const client of clients) {
            const userMapping = userMappings.find(u => u.ts3Id === client.uniqueIdentifier);
            if (!userMapping) {
                console.log(`No mappings for client ${client.uniqueIdentifier} (${client.nickname})`)
            }
        }
    } finally {
        setTimeout(monitorUsers, 10000);
    }
}

monitorUsers();

module.exports = {ts3Sync};