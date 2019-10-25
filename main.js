const {TeamSpeak, QueryProtocol} = require("ts3-nodejs-library");
const dotenv = require('dotenv');

dotenv.config({path: '.env'});

async function start() {
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

    for (const client of clients.slice(0, clients.length / 2)) {
        //todo sync team
        await client.move(otherChannel.cid);
    }
}

start();