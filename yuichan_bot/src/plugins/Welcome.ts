import { Client, GuildMember } from 'discord.js';
import { Logger } from 'log4js';
const packageInfo = require('../../package.json');
import { defaultEmbed } from '../lib/utils';

module.exports = {
    name: 'Welcome',
    description: 'メンバーの入退出管理用',
    disable: false,
    execute: async function(client: Client, log: Logger) {
        client.on('guildMemberAdd', async (member) => {
            member.send({
                embeds: [
                    {
                        title: 'ようこそ！',
                        color: 0xcf5353,
                        timestamp: new Date(),
                        thumbnail: {
                            url: member.user.avatarURL()!,
                        },
                        description: `${member.user.username}さん、Krunker.io日本公式交流Discordへようこそ！まずは<#895638310603595806>で認証をして、<#477778685139746837>で簡単に挨拶をしてみましょう！`,
                        footer: {
                            text: 'Krunker.io日本公式交流Discord',
                            icon_url:
                                'https://media.discordapp.net/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                        },
                    },
                ],
            });
        });
        return;
    },
};
