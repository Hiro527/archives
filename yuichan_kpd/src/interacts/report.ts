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
import { v4 } from 'uuid';
import { ReportBase } from '../@types/types';
import { Controller } from '../lib/Controller';
import {
    createDMessage,
    createLogEmbed,
    createStatusEmbed,
} from '../lib/EmbedMaker';

module.exports = {
    id: 'report',
    permission: 'everyone',
    disable: false,
    execute: async function (
        client: Client,
        args: Array<any>,
        log: Logger,
        interaction: Interaction,
        db: Connection
    ) {
        const guild: Guild = interaction.guild!;
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

        if (interaction.type !== InteractionType.ApplicationCommand) return;

        await interaction.deferReply({
            ephemeral: true,
        });

        await interaction.editReply({
            embeds: [
                {
                    title: '<a:pending:1010737929192226846> 報告を処理中です…',
                    color: Colors.Blurple,
                    footer: {
                        text: `Krunker.io日本公式交流Discord`,
                        icon_url:
                            'https://media.discordapp.net/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                    },
                },
            ],
        });

        const reportBase: ReportBase = {
            report_uuid: v4(),
            player_ign: interaction.options.get('id')?.value?.toString() || '',
            video_url: interaction.options.get('url')?.value?.toString() || '',
            status_id: 'pending',
            reporter_id: interaction.user.id,
            reporter_message:
                interaction.options.get('message')?.value?.toString() ?? '',
        };

        if (reportBase.reporter_message.length > 100) {
            await interaction.editReply({
                embeds: [
                    {
                        title: `❗ エラーが発生しました`,
                        color: Colors.Red,
                        description:
                            '100文字を超える`message`はお使いいただけません。お手数をおかけしますが、もう一度やり直してください。\nこのメッセージは10秒後に自動で削除されます。',
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

        if (
            !/^(https:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)+[\S]{11}(&t=[0-9]+s)?$/.test(
                reportBase.video_url
            ) &&
            !/^(https:\/\/)?(www\.)?streamable\.com\/.+$/.test(
                reportBase.video_url
            )
        ) {
            await interaction.editReply({
                embeds: [
                    {
                        title: `❗ エラーが発生しました`,
                        color: Colors.Red,
                        description: `URLが無効です: ${reportBase.video_url}\n使用可能な動画共有サービスはYouTubeとStreamableのみです。`,
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

        const statusMessage = await reportCh.send({
            embeds: [createStatusEmbed(reportBase)],
        });

        const buttons = [
            new ButtonBuilder()
                .setCustomId(`kpd_${reportBase.report_uuid}_banned`)
                .setStyle(ButtonStyle.Success)
                .setLabel('BAN')
                .setEmoji('🔨'),
            new ButtonBuilder()
                .setCustomId(`kpd_${reportBase.report_uuid}_denied`)
                .setStyle(ButtonStyle.Danger)
                .setLabel('却下')
                .setEmoji('⛔'),
            new ButtonBuilder()
                .setCustomId(`kpd_${reportBase.report_uuid}_reopen`)
                .setStyle(ButtonStyle.Secondary)
                .setLabel('再オープン')
                .setEmoji('↩️')
                .setDisabled(true),
        ];

        const logMessage = await logCh.send({
            embeds: [createLogEmbed(reportBase)],
            components: [
                {
                    type: 1,
                    components: buttons,
                },
            ],
        });

        reportBase.log_message_id = logMessage.id;
        reportBase.status_message_id = statusMessage.id;

        try {
            await controller.insertReport(reportBase);
        } catch (error) {
            log.error(error);
            await interaction.editReply({
                embeds: [
                    {
                        title: `❗ エラーが発生しました`,
                        color: Colors.Red,
                        description:
                            'データベースへの書き込みに失敗しました。お手数をおかけしますが、もう一度やり直してください。\nこのメッセージは10秒後に自動で削除されます。',
                        footer: {
                            text: `Krunker.io日本公式交流Discord`,
                            icon_url:
                                'https://media.discordapp.net/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                        },
                    },
                ],
            });
            setTimeout(async () => {
                await statusMessage.delete();
            }, 10 * 1000);
        }

        const report = await controller.getReport(
            'report_uuid',
            reportBase.report_uuid
        );

        logMessage.edit({
            embeds: [createLogEmbed(report)],
            components: [
                {
                    type: 1,
                    components: buttons,
                },
            ],
        });

        statusMessage.edit({
            embeds: [createStatusEmbed(report)],
        });

        author.send(createDMessage(report));

        await interaction.editReply({
            embeds: [
                {
                    title: `✅ 報告が完了しました`,
                    color: Colors.Green,
                    footer: {
                        text: `Krunker.io日本公式交流Discord`,
                        icon_url:
                            'https://media.discordapp.net/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                    },
                },
            ],
        });

        return;
    },
};
