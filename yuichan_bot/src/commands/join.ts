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
    name: "join",
    permission: "everyone",
    help: "チャットの内容をVCで読み上げます。このコマンドを使う前にVCに接続している必要があります。",
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
