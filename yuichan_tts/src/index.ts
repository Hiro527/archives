import {
    Client,
    Guild,
    GuildMember,
    Intents,
    Message,
    TextChannel,
    User,
    VoiceBasedChannel,
    VoiceChannel,
} from 'discord.js';
import {
    AudioPlayerStatus,
    AudioResource,
    createAudioPlayer,
    createAudioResource,
    DiscordGatewayAdapterCreator,
    entersState,
    getVoiceConnection,
    joinVoiceChannel,
    VoiceConnection,
    VoiceConnectionStatus,
} from '@discordjs/voice';
import { configure, getLogger } from 'log4js';
import { config } from 'node-config-ts';
import { v4 } from 'uuid';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { writeFile } from 'fs/promises';
import { createReadStream } from 'fs';

const packageInfo = require('../package.json');

// ロガーの初期化
configure({
    appenders: {
        consoleLog: {
            type: 'console',
        },
        system: {
            type: 'file',
            filename: 'logs/system.log',
        },
    },
    categories: {
        default: {
            appenders: ['consoleLog'],
            level: 'trace',
        },
        SYSTEM: {
            appenders: ['system', 'consoleLog'],
            level: 'trace',
        },
    },
});
const log = getLogger('SYSTEM');

log.info(`ゆいちゃん TTSハンドラ v${packageInfo.version}`);

const client = new Client({
    intents:
        Intents.FLAGS.GUILDS |
        Intents.FLAGS.GUILD_MESSAGES |
        Intents.FLAGS.GUILD_VOICE_STATES,
});

const ttsClient = new TextToSpeechClient();
let textChannel: TextChannel | null;
let voiceChannel: VoiceBasedChannel | null;
let voiceConnection: VoiceConnection | null;
let voiceObserver: NodeJS.Timer | null;
let messageQueue: Message[] = []; // メッセージキュー

const TOKEN: string = config.token;
const PREFIX: string = config.prefix;
const player = createAudioPlayer();
let talking = false;

let me: GuildMember;

const talk = async () => {
    const message = messageQueue[0];
    let text = message.content
        .replace(/\n/g, ' ')
        .replace(/http(s):\/\/.*/g, 'ゆーあーるえるしょうりゃく')
        .replace(/www\..+.+/g, 'ゆーあーるえるしょうりゃく')
        .replace(/(`|~~)/g, '')
        .replace(/```.+```/g, '')
        .replace(/\|\|.+\|\|/g, 'ネタバレ')
        .replace(/<(@|@&|#).*>/g, '')
        .replace(/<a?:.+:[0-9]+>/g, '');
    if (text.length > 50) {
        text = text.slice(0, 49) + ' 以下略';
    }
    const [response] = await ttsClient.synthesizeSpeech({
        input: {
            text: text,
        },
        voice: {
            languageCode: 'ja-JP',
            ssmlGender: 'NEUTRAL',
            name: 'ja-JP-Standard-A',
        },
        audioConfig: {
            audioEncoding: 'MP3',
        },
    });
    const fileName = `/tmp/${v4()}.mp3`;
    if (response.audioContent) {
        talking = true;
        await writeFile(fileName, response.audioContent, 'binary');
        const audioResource = createAudioResource(createReadStream(fileName));
        player.play(audioResource);
        const promises = [];
        promises.push(entersState(player, AudioPlayerStatus.AutoPaused, 10000));
        promises.push(
            entersState(voiceConnection!, VoiceConnectionStatus.Ready, 10000)
        );
        await Promise.race(promises);
        voiceConnection?.subscribe(player);
        await entersState(player, AudioPlayerStatus.Idle, 2 ** 31 - 1);
        talking = false;
    }
    messageQueue.shift();
    if (messageQueue.length !== 0) {
        talk();
    }
};

client.on('messageCreate', async (message) => {
    if (!message.content || message.author.bot) return;
    const channel = message.channel;
    const member = message.member!;
    if (message.content.startsWith(PREFIX)) {
        const command = message.content.slice(2);
        switch (command) {
            case 'join': {
                await channel.sendTyping();
                if (!(channel instanceof TextChannel)) return;
                // VCに接続していないユーザーは弾く
                if (!member.voice.channel) {
                    await channel.send({
                        embeds: [
                            {
                                title: 'VCに参加していません',
                                color: 0xff0000,
                                timestamp: new Date(),
                                description: `<@${member.id}> VCに接続してからコマンドを使用してください`,
                                footer: {
                                    text: 'Krunker.io日本公式交流Discord',
                                    icon_url:
                                        'https://cdn.discordapp.com/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                                },
                            },
                        ],
                    });
                    break;
                }
                voiceChannel = member.voice.channel;
                try {
                    voiceConnection = joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: voiceChannel.guildId,
                        adapterCreator: voiceChannel.guild
                            .voiceAdapterCreator as DiscordGatewayAdapterCreator,
                        // 既知のバグ: https://github.com/discordjs/voice/issues/166
                        selfMute: false,
                        selfDeaf: true,
                    });
                    textChannel = channel;
                    if (voiceObserver) {
                        clearInterval(voiceObserver);
                        voiceObserver = null;
                    }
                    voiceObserver = setInterval(async () => {
                        if (
                            me.voice.channel?.members.size ===
                            me.voice.channel?.members.filter(
                                (member) => member.user.bot
                            ).size
                        ) {
                            clearInterval(voiceObserver!);
                            voiceConnection?.disconnect();
                            await textChannel?.send({
                                embeds: [
                                    {
                                        title: 'VCから切断しました',
                                        color: 0xff0000,
                                        timestamp: new Date(),
                                        description: `誰も居なくなっちゃったよ><`,
                                        thumbnail: {
                                            url:
                                                'https://cdn.discordapp.com/attachments/918062537558327306/919539558423601172/download20211200193224.png',
                                        },
                                        footer: {
                                            text:
                                                'Krunker.io日本公式交流Discord',
                                            icon_url:
                                                'https://cdn.discordapp.com/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                                        },
                                    },
                                ],
                            });
                            textChannel = null;
                            voiceChannel = null;
                            voiceConnection = null;
                        }
                    }, 1000);
                } catch (_e) {
                    const err = _e as Error;
                    const errId = v4();
                    log.error(`エラーID: ${errId}\n${err}`);
                    await channel.send({
                        embeds: [
                            {
                                title: 'VCに接続できませんでした',
                                color: 0xff0000,
                                timestamp: new Date(),
                                description: `<@${member.id}> エラーが発生しました\n\`\`\`${errId} / ${err.name}\`\`\`\``,
                                footer: {
                                    text: 'Krunker.io日本公式交流Discord',
                                    icon_url:
                                        'https://cdn.discordapp.com/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                                },
                            },
                        ],
                    });
                    break;
                }
                await channel.send({
                    embeds: [
                        {
                            title: 'VCに接続しました',
                            color: 0x00ff00,
                            timestamp: new Date(),
                            description: `<@${member.id}>が<#${voiceChannel.id}>で読み上げを開始しました`,
                            footer: {
                                text: 'Krunker.io日本公式交流Discord',
                                icon_url:
                                    'https://cdn.discordapp.com/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                            },
                        },
                    ],
                });
                break;
            }
            case 'bye':
            case 'dc': {
                await channel.sendTyping();
                if (!(channel instanceof TextChannel)) return;
                // VCに接続していないユーザーは弾く
                if (!member.voice.channel) {
                    await channel.send({
                        embeds: [
                            {
                                title: 'VCに参加していません',
                                color: 0xff0000,
                                timestamp: new Date(),
                                description: `<@${member.id}> VCに接続してからコマンドを使用してください`,
                                footer: {
                                    text: 'Krunker.io日本公式交流Discord',
                                    icon_url:
                                        'https://cdn.discordapp.com/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                                },
                            },
                        ],
                    });
                    break;
                }
                // 接続してない場合は弾く
                if (!voiceConnection) {
                    await channel.send({
                        embeds: [
                            {
                                title: '読み上げを行っていません',
                                color: 0xff0000,
                                timestamp: new Date(),
                                description: `<@${member.id}> 現在読み上げ中のチャンネルはありません`,
                                footer: {
                                    text: 'Krunker.io日本公式交流Discord',
                                    icon_url:
                                        'https://cdn.discordapp.com/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                                },
                            },
                        ],
                    });
                    break;
                }
                clearInterval(voiceObserver!);
                if (!talking) {
                    voiceConnection?.disconnect();
                    textChannel = null;
                    voiceChannel = null;
                    voiceConnection = null;
                    await channel.send({
                        embeds: [
                            {
                                title: 'VCから切断しました',
                                color: 0xff0000,
                                timestamp: new Date(),
                                description: `<@${member.id}> が読み上げを終了しました`,
                                footer: {
                                    text: 'Krunker.io日本公式交流Discord',
                                    icon_url:
                                        'https://cdn.discordapp.com/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                                },
                            },
                        ],
                    });
                } else {
                    const statusMessage = await channel.send({
                        embeds: [
                            {
                                title: '処理の終了を待っています…',
                                color: 0xffff00,
                                timestamp: new Date(),
                                description: `現在読み上げ中のためしばらくお待ちください…`,
                                footer: {
                                    text: 'Krunker.io日本公式交流Discord',
                                    icon_url:
                                        'https://cdn.discordapp.com/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                                },
                            },
                        ],
                    });
                    const interval = setInterval(async () => {
                        if (!talking) {
                            voiceConnection?.disconnect();
                            textChannel = null;
                            voiceChannel = null;
                            voiceConnection = null;
                            await statusMessage.edit({
                                embeds: [
                                    {
                                        title: 'VCから切断しました',
                                        color: 0xff0000,
                                        timestamp: new Date(),
                                        description: `<@${member.id}> が読み上げを終了しました`,
                                        footer: {
                                            text:
                                                'Krunker.io日本公式交流Discord',
                                            icon_url:
                                                'https://cdn.discordapp.com/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                                        },
                                    },
                                ],
                            });
                            clearInterval(interval);
                        }
                    }, 100);
                }
                break;
            }
        }
    } else if (channel.id === textChannel?.id) {
        if (messageQueue.length === 0) {
            messageQueue.push(message);
            talk();
        } else {
            messageQueue.push(message);
        }
    }
});

client.once('ready', () => {
    log.info(`ログイン成功: ${client.user?.tag}(UserID: ${client.user?.id})`);
    me = client.guilds.cache
        .get(config.guildId)
        ?.members.cache.get(client.user?.id!)!;
});

client.on('error', (err) => {
    log.error(err);
});

client.login(TOKEN);
