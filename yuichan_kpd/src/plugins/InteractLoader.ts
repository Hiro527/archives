/* eslint-disable @typescript-eslint/no-var-requires */
import { Client, GuildMember, InteractionType } from 'discord.js';
import { readdirSync } from 'fs';
import { Logger } from 'log4js';
import { Connection } from 'mysql';
import path from 'path';
import { Interact } from '../@types/types';

module.exports = {
    name: 'InteractionHandler',
    description: 'インタラクションハンドラ',
    disable: false,
    execute: async function (client: Client, log: Logger, db: Connection) {
        const interacts: { [name: string]: Interact } = {};

        Object.values(
            readdirSync(path.join(__dirname, '../interacts'))
        ).forEach((v: string) => {
            if (v.endsWith('.map')) return;
            const interact: Interact = require(path.join(
                __dirname,
                `../interacts/${v}`
            ));
            if (!interact.disable) {
                interacts[interact.id] = interact;
            }
        });
        client.on('interactionCreate', async (interaction) => {
            // コマンド/ボタン用
            const commandLine =
                interaction.type === InteractionType.ApplicationCommand
                    ? interaction.commandName
                    : interaction.type === InteractionType.MessageComponent
                    ? interaction.customId
                    : '';
            const command = commandLine.split('_')[0];
            const args = commandLine.split('_').slice(1);
            const member = interaction.member;
            const interact = interacts[command];
            if (member instanceof GuildMember && interact) {
                // 通常のテキストチャンネル
                if (
                    (member.roles.cache.some(
                        (role) => role.id === interact.permission
                    ) ||
                        interact.permission === 'everyone') &&
                    !interact.disable
                ) {
                    await interact.execute(client, args, log, interaction, db);
                }
            } else if (!interaction.guild) {
                // DM
                await interact.execute(client, args, log, interaction, db);
            }
        });
        return;
    },
};
