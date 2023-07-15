import {
    Client,
    Guild,
    GuildMember,
    Message,
    MessageEmbed,
    TextChannel,
    User,
} from "discord.js";
import { Logger } from "log4js";
import { defaultEmbed } from '../lib/utils';

module.exports = {
    name: "bye",
    permission: "everyone",
    help: "読み上げを終了します。",
    disable: true,
    hidden: false,
    args: {
        must: [],
        optional: []
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
        // Do something fun!
        return;
    },
};
