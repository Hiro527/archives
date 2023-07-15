import {
    Client,
    Guild,
    GuildMember,
    Message,
    TextChannel,
    User,
} from "discord.js";
import { Logger } from "log4js";
import { defaultEmbed } from '../lib/utils';

module.exports = {
    name: "ping",
    permission: "everyone",
    help: "Ping! Pong!",
    disable: false,
    hidden: true,
    args: {
        must: [],
        optional: [],
    },
    execute: async function(
        client: Client,
        log: Logger,
        message: Message,
        args: [string]
    ) {
        const guild: Guild = message.guild!;
        const channel: TextChannel = message.channel as TextChannel;
        const author: User = message.author;
        const member: GuildMember = message.member!;
        await message.reply("Pong!");
        return;
    },
};
