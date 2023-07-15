const config = require('config');
const packageInfo = require('../package.json');

module.exports = {
    commands: {
        help: {
            type: 'embed',
            permission: '@everyone',
            embed: {
                author: {
                    name: `ゆいちゃん v${packageInfo.version}`,
                    icon_url: 'https://cdn.discordapp.com/attachments/698690249571958838/853073427803144202/9b24d432c1769a29eff7fac9b392f87dac49df1c.png',
                },
                color: 0xcf5353,
                timestamp: new Date(),
                fields: [
                    {
                        name: `${config.prefix}help`,
                        value: 'このコマンドです。Botの使い方を知ることができます。',
                    },
                    {
                        name: `${config.prefix}rule [ルール番号]`,
                        value: 'ルール番号を指定してルールを表示することができます。'
                    },
                    {
                        name: `${config.prefix}invite`,
                        value: 'サーバーの招待リンクを送信します。'
                    },
                    {
                        name: `${config.prefix}comp [open/close]`,
                        value: 'Pickup関連チャンネルを操作します。<@&789526887969718323>以上が使用できます。'
                    },
                    {
                        name: `${config.prefix}join/bye`,
                        value: '読み上げ機能を操作します。joinで開始、byeで終了します。'
                    }
                ]
            }
        },
        invite: {
            type: 'text',
            permission: '@everyone',
            text: 'https://discord.gg/C7YXczV',
        },
        hassich: {
            type: 'text',
            permission: '@everyone',
            text: 'ﾊｼｯﾁｻﾝ ｶﾜｲｲﾔｯﾀｰ!',
        },
        gay: {
            type: 'text',
            permission: '@everyone',
            text: 'Yes, Sidney is gay.',
        },
        rule: {
            type: 'exec',
            permission: '@everyone',
            execute: async (client, message, systemLog, args) => {
                const rules = {
                    version: '1.0.8',
                    1: '**Krunker公式に提示されているルールを破る(チート行為 等)**',
                    2: '**スパム行為**',
                    3: '**メンションの悪用**',
                    4: '**不用意にログを流す行為(長文コピペなどもこれに該当します。気をつけましょう。)**',
                    5: '**他人を不快にする、傷つけるような発言。冗談でもNGです。(マナー厳守！礼節に欠けるような態度はやめましょう。)**',
                    6: '**性的、暴力的及び常識の範囲を超えるような発言・話題(直接的・またはそれに近い表現、それを連想できるような単語は避けてください。引用、スクショ等もNGです！)**',
                    7: '**定められたトピック、チャンネルで発言を行ってください。**',
                    8: '**本人と識別できる、適切なニックネームを使ってください。**',
                    9: '**卑猥、暴力的、またはふさわしくない単語をニックネームに使わないでください。**',
                    10: '**自分を他人と偽るなりすまし行為の禁止**',
                    11: '**他Discordサーバーの招待リンクを貼る行為の禁止**',
                    12: '**その他、運営が不適切だと判断した行為の禁止**',
                    13: '**サーバーに入る前にDiscord利用規約を読んで、それを守ってください**'
                }
                if (!args[0] || !rules[args[0]] || args[0] === 'version') {
                    message.channel.send(`使い方: \`${config.prefix}rule [ルール番号]\``);
                    return;
                }
                await message.channel.send({ embed: {
                    title: '日本公式交流ルールブック',
                    thumbnail: {
                        url: 'https://cdn.discordapp.com/attachments/698690249571958838/853504621246414918/KrunkerJP.png',
                    },
                    color: 0xcf5353,
                    fields: [
                        {
                            name: `ルール${args[0]}`,
                            value: rules[args[0]],
                        }
                    ],
                    footer: {
                        text: `ルール v${rules.version} | コマンド v1.0.1`
                    }
                }});
            }
        },
        comp: {
            type: 'exec',
            permission: 'トーナメントスタッフ',
            execute: async (client, message, systemLog, args) => {
                const compChs = ['896008938422693929', '896006814531989504', '896006956580495360', '896006895964422174', '896007022925987870'];
                const openPermission = [
                    {
                        // member
                        id: '895638609456136202',
                        deny: [
                            'VIEW_CHANNEL',
                            'CONNECT',
                            'SEND_MESSAGES',
                        ],
                    },
                    {
                        // everyone
                        id: '477748107782914058',
                        deny: [
                            'VIEW_CHANNEL',
                            'CONNECT',
                            'SEND_MESSAGES',
                        ],
                    },
                    {
                        // Tear 1
                        id: '895646364883640370',
                        allow: [
                            'VIEW_CHANNEL',
                            'CONNECT',
                            'SEND_MESSAGES',
                        ],
                    },
                    {
                        // 管理職
                        id: '694200800603406416',
                        allow: [
                            'VIEW_CHANNEL',
                            'CONNECT',
                            'SEND_MESSAGES',
                        ],
                    },
                    {
                        // トーナメントスタッフ
                        id: '789526887969718323',
                        allow: [
                            'VIEW_CHANNEL',
                            'CONNECT',
                            'SEND_MESSAGES',
                        ],
                    },
                ];
                const closePermission = [
                    {
                        // member
                        id: '895638609456136202',
                        deny: [
                            'VIEW_CHANNEL',
                            'CONNECT',
                            'SEND_MESSAGES',
                        ],
                    },
                    {
                        // everyone
                        id: '477748107782914058',
                        deny: [
                            'VIEW_CHANNEL',
                            'CONNECT',
                            'SEND_MESSAGES',
                        ],
                    },
                    {
                        // Tear 1
                        id: '895646364883640370',
                        deny: [
                            'VIEW_CHANNEL',
                            'CONNECT',
                            'SEND_MESSAGES',
                        ],
                    },
                    {
                        // 管理職
                        id: '694200800603406416',
                        allow: [
                            'VIEW_CHANNEL',
                            'CONNECT',
                            'SEND_MESSAGES',
                        ],
                    },
                    {
                        // トーナメントスタッフ
                        id: '789526887969718323',
                        allow: [
                            'VIEW_CHANNEL',
                            'CONNECT',
                            'SEND_MESSAGES',
                        ],
                    },
                ];
                switch (args[0]) {
                    case 'open': {
                        Object.values(compChs).forEach(async (v) => {
                            try {
                                await client.channels.cache.get(v).overwritePermissions(openPermission);
                            } catch (e) {
                                systemLog.fatal('実行時エラー: チャンネル権限のオーバーライドに失敗しました');
                                systemLog.fatal(e);
                                message.channel.send('チャンネル権限の書き換え中にエラーが発生しました');
                            }
                        });
                        message.channel.send('Pickupを開放しました');
                        break;
                    }
                    case 'close': {
                        Object.values(compChs).forEach(async (v) => {
                            try {
                                await client.channels.cache.get(v).overwritePermissions(closePermission);
                            } catch (e) {
                                systemLog.fatal('実行時エラー: チャンネル権限のオーバーライドに失敗しました');
                                systemLog.fatal(e);
                                message.channel.send('チャンネル権限の書き換え中にエラーが発生しました');
                            }
                        });
                        message.channel.send('Pickupを閉鎖しました');
                        break;
                    }
                }
            }
        },
        join: {
            type: 'tts',
            permission: '@everyone',
            execute: async (client, message, systemLog, args) => {
                const channel = message.channel;
                const member = message.member;
                const voiceChannel = member.voice.channel;
                if (!voiceChannel) {
                    await channel.send({
                        embed: {
                            title: 'VCに参加していません',
                            color: 0xff0000,
                            timestamp: new Date,
                            description: `<@${member.id}> VCに接続してからコマンドを使用してください`,
                            footer: {
                                text: 'Krunker日本公式交流',
                                icon_url: 'https://cdn.discordapp.com/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                            },
                        }
                    });
                    return;
                }
                const connection = await voiceChannel.join().catch(async err => {
                    await channel.send({
                        embed: {
                            title: 'VCに接続できませんでした',
                            color: 0xff0000,
                            timestamp: new Date,
                            description: `<@${member.id}> エラーが発生しました`,
                            footer: {
                                text: 'Krunker日本公式交流',
                                icon_url: 'https://cdn.discordapp.com/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                            },
                        }
                    });
                })
                await channel.send({
                    embed: {
                        title: 'VCに接続しました',
                        color: 0x00ff00,
                        timestamp: new Date,
                        description: `<@${member.id}> が読み上げを開始しました`,
                        footer: {
                            text: 'Krunker日本公式交流',
                            icon_url: 'https://cdn.discordapp.com/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                        },
                    }
                });
                systemLog.info(`ボイスチャンネルに接続しました: ${voiceChannel.name} / ${message.author.tag}`);
                return { id: 'TTS', value: [channel.id, voiceChannel.id, connection] };
            }
        },
        bye: {
            type: 'tts',
            permission: '@everyone',
            execute: async (client, message, systemLog, args) => {
                const channel = message.channel;
                const member = message.member;
                const me = message.guild.members.cache.get(process.argv[2] === '--debug' ? '888951451789975614' : '837933813149204480');
                const voiceChannel = me.voice.channel;
                if (!me.voice.channel) {
                    await channel.send({
                        embed: {
                            title: 'VCに参加していません',
                            color: 0xff0000,
                            timestamp: new Date,
                            description: `<@${member.id}> VCに接続してからコマンドを使用してください`,
                            footer: {
                                text: 'Krunker日本公式交流',
                                icon_url: 'https://cdn.discordapp.com/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                            },
                        }
                    });
                    return;
                };
                systemLog.info(`ボイスチャンネルから切断しました: ${voiceChannel.name} / ${message.author.tag}`);
                me.voice.channel.leave();
                await channel.send({
                    embed: {
                        title: 'VCから切断しました',
                        color: 0x00ff00,
                        timestamp: new Date,
                        description: `<@${member.id}> が読み上げを終了しました`,
                        footer: {
                            text: 'Krunker日本公式交流',
                            icon_url: 'https://cdn.discordapp.com/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                        },
                    }
                });
                return { id: 'TTS', value: [null, null, null] };
            }
        },
    }
}