import {
    Client,
    Guild,
    GuildMember,
    Interaction,
    Message,
    MessageEmbed,
    TextChannel,
    User,
    ButtonInteraction
} from "discord.js";
import { Logger } from "log4js";
import { defaultEmbed } from '../lib/utils';

module.exports = {
    id: "template",
    permission: "everyone",
    disable: true,
    execute: async function(
        client: Client,
        log: Logger,
        interaction: Interaction
    ) {
        const guild: Guild = interaction.guild!;
        const channel: TextChannel = interaction.channel as TextChannel;
        const author: User = interaction.user;
        const member: GuildMember = interaction.member as GuildMember;
        // Do something fun!
        return;
    },
};
