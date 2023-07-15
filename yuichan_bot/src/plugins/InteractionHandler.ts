import {
    Client,
    Guild,
    GuildMember,
} from "discord.js";
import { readdirSync } from "fs";
import { Logger } from "log4js";
import path from "path";
import { defaultEmbed } from '../lib/utils';
import { Interact } from '../@types/types'

module.exports = {
    name: "InteractionHandler",
    description: "インタラクションハンドラ",
    disable: false,
    execute: async function(client: Client, log: Logger) {
        const interacts: { [name: string]: Interact } = {};

        Object.values(
            readdirSync(path.join(__dirname, "../interacts"))
        ).forEach((v: string) => {
            const interact: Interact = require(path.join(__dirname, `../interacts/${v}`));
            if (!interact.disable) {
                interacts[interact.id] = interact;
            }
        });
        client.on("interactionCreate", async (interaction) => {
            const guild: Guild | null = interaction.guild;
            const member = interaction.member;
            const interact =
                interaction.isButton() && interacts[interaction.customId];
            if (member instanceof GuildMember && interact && !interact.disable) {
                if (
                    member.roles.cache.some(
                        (role) => role.id === interact.permission
                    ) ||
                    interact.permission === "everyone"
                ) {
                    await interact.execute(client, log, interaction);
                }
            }
        });
        return;
    },
};
