const {TeamSpeak, QueryProtocol} = require("ts3-nodejs-library");
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config({path: '.env'});

const userMappings = JSON.parse(fs.readFileSync('userMappings.json'));

async function ts3Sync(teams) {
    const ts3 = await TeamSpeak.connect({
        host: process.env.HOST,
        protocol: QueryProtocol.RAW,
        queryport: 10011,
        serverport: 9987,
        username: 'serveradmin',
        password: process.env.PASSWORD,
        nickname: 'Le Bot'
    });

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

        if (team.team === 2) {
            await client.move(otherChannel.cid);
        }
    }
}

module.exports = {ts3Sync};