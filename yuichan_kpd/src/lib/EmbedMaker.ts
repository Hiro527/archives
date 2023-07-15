/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ButtonBuilder,
    ButtonStyle,
    Colors,
    MessageCreateOptions,
} from 'discord.js';
import { Report, ReportBase } from '../@types/types';

const checkType = (report: any): report is Report => {
    try {
        return report.id ? true : false;
    } catch {
        return false;
    }
};

export const createStatusEmbed = (report: ReportBase | Report) => {
    const isReport = checkType(report);
    const result = {
        title: `報告: ${report.player_ign}`,
        color: Colors.Red,
        fields: [
            {
                name: '作成日時',
                value: isReport
                    ? `<t:${Math.ceil(
                          new Date(report.created_at).getTime() / 1000
                      )}:F>`
                    : '取得中…',
            },
            {
                name: '被疑者のID',
                value: report.player_ign,
            },
            {
                name: '被疑者のプロフィール',
                value: `https://krunker.io/social.html?p=profile&q=${report.player_ign}`,
            },
            {
                name: '報告ID',
                value: `\`${report.report_uuid}\``,
            },
        ],
        footer: {
            text: `Krunker.io日本公式交流Discord`,
            icon_url:
                'https://media.discordapp.net/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
        },
    };
    return result;
};

export const createLogEmbed = (
    report: ReportBase | Report,
    color: number = Colors.Red
) => {
    const isReport = checkType(report);
    const titles: {
        [index: string]: string;
    } = {
        pending: '保留中',
        banned: 'BAN',
        denied: '却下',
        reopen: '再オープン',
        canceled: 'キャンセル',
    };
    const result = {
        title: `${titles[report.status_id]}: ${report.player_ign}`,
        color: color,
        fields: [
            {
                name: '作成日時',
                value: isReport
                    ? `<t:${Math.ceil(
                          new Date(report.created_at).getTime() / 1000
                      )}:F>`
                    : '取得中…',
            },
            {
                name: '最終更新日時',
                value: isReport
                    ? `<t:${Math.ceil(
                          new Date(report.updated_at).getTime() / 1000
                      )}:F> (${
                          report.officer_id
                              ? `<@${report.officer_id}>`
                              : 'KPD System'
                      })`
                    : '取得中…',
            },
            {
                name: '被疑者のID',
                value: report.player_ign,
            },
            {
                name: '被疑者のプロフィール',
                value: `https://krunker.io/social.html?p=profile&q=${report.player_ign}`,
            },
            {
                name: '証拠動画のURL',
                value: report.video_url,
            },
            {
                name: 'メッセージ',
                value: report.reporter_message || '空欄',
            },
            {
                name: '通報したユーザー',
                value: `<@${report.reporter_id}>`,
            },
            {
                name: '報告ID',
                value: `\`${report.report_uuid}\``,
            },
        ],
        footer: {
            text: `Krunker.io日本公式交流Discord`,
            icon_url:
                'https://media.discordapp.net/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
        },
    };
    return result;
};

export const createDMessage = (report: Report) => {
    const buttons = [
        new ButtonBuilder()
            .setCustomId(`user_${report.report_uuid}_canceled`)
            .setStyle(ButtonStyle.Danger)
            .setLabel('キャンセル')
            .setEmoji('⚠'),
    ];
    const messageOpt: MessageCreateOptions = {
        embeds: [
            {
                title: '報告内容の確認',
                color: Colors.Green,
                fields: [
                    {
                        name: '作成日時',
                        value: `<t:${Math.ceil(
                            new Date(report.created_at).getTime() / 1000
                        )}:F>`,
                    },
                    {
                        name: '被疑者のID',
                        value: report.player_ign,
                    },
                    {
                        name: '被疑者のプロフィール',
                        value: `https://krunker.io/social.html?p=profile&q=${report.player_ign}`,
                    },
                    {
                        name: '証拠動画のURL',
                        value: report.video_url,
                    },
                    {
                        name: 'メッセージ',
                        value: report.reporter_message || '空欄',
                    },
                    {
                        name: '報告ID',
                        value: `\`${report.report_uuid}\``,
                    },
                ],
            },
            {
                title: 'お問い合わせ内容について',
                color: Colors.Green,
                description: `・対応までに数日かかる場合があります。対応され次第このアカウントからDMにて結果が送信されますので、しばらくお待ち下さい。\n・通報についてお問い合わせいただく際は<#1025747179261939762>にて上記の報告IDを添えてお問い合わせいただくようお願いいたします。\n・下の\`⚠キャンセル\`を押すと送信した報告をキャンセルすることが出来ます。`,
                footer: {
                    text: `Krunker.io日本公式交流Discord`,
                    icon_url:
                        'https://media.discordapp.net/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                },
            },
        ],
        components: [
            {
                type: 1,
                components: buttons,
            },
        ],
    };
    return messageOpt;
};
