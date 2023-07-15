import { MessageEmbed } from 'discord.js';
import { config } from 'node-config-ts';
const packageInfo = require('../../package.json');

export const defaultEmbed = () => {
    return new MessageEmbed()
        .setColor(0xcf5353)
        .setFooter({
            text: `Krunker.io日本公式交流Discord`,
            iconURL:
                'https://media.discordapp.net/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
        })
        .setTimestamp(new Date());
};

export const getVersion = (): string => {
    return `${packageInfo.version}_${packageInfo.apiVersion}${config.release}`;
};
