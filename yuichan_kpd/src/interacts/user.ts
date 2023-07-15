import {
    ButtonBuilder,
    ButtonStyle,
    Client,
    Colors,
    Guild,
    Interaction,
    InteractionType,
    NewsChannel,
    TextChannel,
    User,
} from 'discord.js';
import { Logger } from 'log4js';
import { Connection } from 'mysql';
import { config } from 'node-config-ts';
import { Report } from '../@types/types';
import { Controller } from '../lib/Controller';
import { createLogEmbed } from '../lib/EmbedMaker';

module.exports = {
    id: 'user',
    permission: 'everyone',
    disable: false,
    execute: async function (
        client: Client,
        args: Array<any>,
        log: Logger,
        interaction: Interaction,
        db: Connection
    ) {
        const guild: Guild = await client.guilds.cache.get(config.guildId)!;
        const author: User = interaction.user;

        const reportCh = guild.channels.cache.find(
            (channel) => channel.id === config.reportChannelId
        )!;
        const logCh = guild.channels.cache.find(
            (channel) => channel.id === config.logChannelId
        )!;
        if (
            !(
                reportCh instanceof TextChannel ||
                reportCh instanceof NewsChannel
            ) ||
            !(logCh instanceof TextChannel)
        ) {
            return;
        }

        const controller = new Controller(db, log);

        if (interaction.type !== InteractionType.MessageComponent) return;
        await interaction.deferUpdate();

        const report = await controller.getReport('report_uuid', args[0]);
        const status = args[1];

        const logMessage = await logCh.messages.fetch(report.log_message_id);

        // 対応済みの場合
        if (report.status_id !== 'pending') {
            await interaction.followUp({
                embeds: [
                    {
                        title: '❗対応/キャンセル済の報告です',
                        color: Colors.Red,
                        description: `この報告(ID: \`${report.report_uuid}\`)はすでにKPDによって対応されているか、もしくはキャンセル済みのためキャンセルすることは出来ません。`,
                        footer: {
                            text: `Krunker.io日本公式交流Discord`,
                            icon_url:
                                'https://media.discordapp.net/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                        },
                    },
                ],
            });
            return;
        }

        // 各データの更新
        report.status_id = status;
        report.officer_id = author.id;
        let newReport: Report | null = null;
        try {
            // レコードの更新
            await controller.updateReport(report);
            // 更新後のレコードを取得
            newReport = await controller.getReport(
                'report_uuid',
                report.report_uuid
            );
        } catch (error) {
            log.error(error);
            await interaction.followUp({
                embeds: [
                    {
                        title: `❗ エラーが発生しました`,
                        color: Colors.Red,
                        description:
                            'データベースへの書き込みに失敗しました。お手数をおかけしますが、もう一度やり直してください。',
                        footer: {
                            text: `Krunker.io日本公式交流Discord`,
                            icon_url:
                                'https://media.discordapp.net/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                        },
                    },
                ],
            });
        }
        if (!newReport) {
            await interaction.followUp({
                embeds: [
                    {
                        title: `❗ エラーが発生しました`,
                        color: Colors.Red,
                        description:
                            'データベースへからの読み込みに失敗しました。お手数をおかけしますが、もう一度やり直してください。',
                        footer: {
                            text: `Krunker.io日本公式交流Discord`,
                            icon_url:
                                'https://media.discordapp.net/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                        },
                    },
                ],
            });
            return;
        }
        const buttons = [
            new ButtonBuilder()
                .setCustomId(`kpd_${report.report_uuid}_banned`)
                .setStyle(ButtonStyle.Success)
                .setLabel('BAN')
                .setEmoji('🔨')
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId(`kpd_${report.report_uuid}_denied`)
                .setStyle(ButtonStyle.Danger)
                .setLabel('却下')
                .setEmoji('⛔')
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId(`kpd_${report.report_uuid}_reopen`)
                .setStyle(ButtonStyle.Secondary)
                .setLabel('再オープン')
                .setEmoji('↩️'),
        ];
        await logMessage!.edit({
            embeds: [createLogEmbed(report, Colors.LightGrey)],
            components: [
                {
                    type: 1,
                    components: buttons,
                },
            ],
        });
        await interaction.followUp({
            embeds: [
                {
                    title: '正常にキャンセルされました',
                    description:
                        'ご送信いただいた報告は正常にキャンセルされました。',
                    color: Colors.Green,
                    footer: {
                        text: `Krunker.io日本公式交流Discord`,
                        icon_url:
                            'https://media.discordapp.net/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                    },
                },
            ],
        });
    },
};
