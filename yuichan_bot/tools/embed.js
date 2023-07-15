const { Client, Intents, TextChannel } = require('discord.js');
const config = require('config');
const settings = require(process.argv[2]);

const client = new Client({
    intents: Intents.FLAGS.GUILDS | Intents.FLAGS.GUILD_MESSAGES,
});

client.once('ready', async () => {
    console.log('Ready');
    /**
     * @type { TextChannel }
     */
    const channel = client.channels.cache.get(settings.channelId);
    await channel.send(settings.messageOptions);
    console.log('Done');
    process.exit(0);
});

client.login('ODM3OTMzODEzMTQ5MjA0NDgw.YIzwrQ.rH2i0_95s_hhFnWyXvFaSoY8-j0');
