const { MessageOptions, MessageActionRow, Message, MessageButton } = require('discord.js');
const packageInfo = require('../../package.json');
const fs = require('fs');
const path = require('path');

module.exports = {
    // channelId: '986501150461284452', // #テスト用
    channelId: '989052984942014474',
    /**
     * @type { MessageOptions }
     */
    messageOptions: {
        embeds: [
            {
                title: 'Krunker Japan Tournament #4',
                color: 0xff3232,
                description: fs.readFileSync(path.resolve('D:/Git/yuichan_bot/tools/embeds/kjt4-rule.md')).toString(),
                thumbnail: {
                    url: 'https://cdn.discordapp.com/attachments/985005215612821545/995322657211940965/logo_big.png',
                },
                footer: {
                    icon_url: 'https://cdn.discordapp.com/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                    text: 'Krunker.io日本公式交流Discord',
                },
            },
        ],
    },
};