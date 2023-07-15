import {
    ButtonBuilder,
    ButtonStyle,
    Client,
    Colors,
    Guild,
    Interaction,
    InteractionType,
    MessageCreateOptions,
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
    id: 'kpd',
    permission: 'everyone',
    disable: false,
    execute: async (
        client: Client,
        args: Array<any>,
        log: Logger,
        interaction: Interaction,
        db: Connection
    ) => {
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

        if (interaction.type !== InteractionType.MessageComponent) return;
        await interaction.deferUpdate();

        const report = await controller.getReport('report_uuid', args[0]);
        const status = args[1];

        const reporter = await guild.members.cache.find(
            (user) => user.id === report.reporter_id
        );

        if (report.status_message_id) {
            const statusMessage = await reportCh.messages.fetch(
                report.status_message_id
            );
            await statusMessage.delete();
            report.status_message_id = '';
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

        const newMessage: MessageCreateOptions = {};
        const buttons = [
            new ButtonBuilder()
                .setCustomId(`kpd_${report.report_uuid}_banned`)
                .setStyle(ButtonStyle.Success)
                .setLabel('BAN')
                .setEmoji('🔨'),
            new ButtonBuilder()
                .setCustomId(`kpd_${report.report_uuid}_denied`)
                .setStyle(ButtonStyle.Danger)
                .setLabel('却下')
                .setEmoji('⛔'),
            new ButtonBuilder()
                .setCustomId(`kpd_${report.report_uuid}_reopen`)
                .setStyle(ButtonStyle.Secondary)
                .setLabel('再オープン')
                .setEmoji('↩️'),
        ];

        const messageText = {
            title: '以前ご報告いただいたプレイヤーについて',
            content: '',
            color: Colors.Green,
        };

        switch (status) {
            case 'banned': {
                buttons[0].setDisabled(true);
                buttons[1].setDisabled(true);
                newMessage.embeds = [createLogEmbed(report, Colors.Green)];
                messageText.content = `以前ご報告いただいた \`${report.player_ign}\` につきましては、不正行為が認められたためBANされたことをお知らせいたします。ご報告ありがとうございました。`;
                break;
            }
            case 'denied': {
                buttons[0].setDisabled(true);
                buttons[1].setDisabled(true);
                newMessage.embeds = [createLogEmbed(report, Colors.DarkGrey)];
                messageText.content = `以前ご報告いただいた \`${report.player_ign}\` につきましては、不正行為が認められなかったため処置が行われなかったことをお知らせいたします。ご報告ありがとうございました。`;
                break;
            }
            case 'reopen': {
                buttons[0].setDisabled(false);
                buttons[1].setDisabled(false);
                buttons[2].setDisabled(true);
                newMessage.embeds = [createLogEmbed(report, Colors.Red)];
                messageText.content = `以前ご報告いただいた \`${report.player_ign}\` につきましては、先程の処置を取り消されたことをお知らせいたします。今後の報告をお待ちいただくようお願いいたします。`;
                break;
            }
        }

        newMessage.components = [
            {
                type: 1,
                components: buttons,
            },
        ];
        await reporter?.send({
            embeds: [
                {
                    title: messageText.title,
                    description: messageText.content,
                    color: messageText.color,
                    footer: {
                        text: `Krunker.io日本公式交流Discord`,
                        icon_url:
                            'https://media.discordapp.net/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                    },
                },
            ],
        });
        await interaction.message.edit(newMessage);
        return;
    },
};
