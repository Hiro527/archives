const Discord = require('discord.js');
const log4js = require('log4js');
const commands = require('./lib/commands');
const config = require('config');
const packageInfo = require('./package.json');
const client = new Discord.Client();

const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
const { v4 } = require('uuid');
const path = require('path');
const openjtalk = require('./lib/openjtalk');
const emojiList = require('./lib/emoji_ja.json');
const romajiConv = require('@koozaki/romaji-conv');

const users = require('./users');

const permissionLevel = ['@everyone', 'トーナメントスタッフ', '管理職', '副管理人', '管理人'];

const DATA = {
    TTS: [null, null],
    MSG_QUEUE: [],
    INTERVAL: null
};

const DISCORD_TOKEN = process.argv[2] === '--debug' ? require('./DISCORD_TOKEN.json').token_dev : require('./DISCORD_TOKEN.json').token;

const PREFIX = process.argv[2] === '--debug' ? 'b.' : config.prefix;

const NOTIFY_CH = '477780572085944320';
const UPDATE_CH = '516652805084282891';

const loggerInit = () => {
    log4js.configure({
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
                appenders: [
                    'consoleLog',
                ],
                level: [
                    'trace',
                ],
            },
            SYSTEM: {
                appenders: [
                    'system',
                    'consoleLog',
                ],
                level: [
                    'debug',
                ],
            },
        },
    });
};
loggerInit();
const systemLog = log4js.getLogger('SYSTEM');

const tts = new openjtalk(systemLog);

client.login(DISCORD_TOKEN).catch((e) => {
    systemLog.fatal('ログイン失敗: 詳細は./logs/system.logを確認してください');
    systemLog.fatal(e);
});

const permissionError = async (message, required) => {
    systemLog.error(`権限エラー: ${message.content}(必要: ${required}), ${message.author.tag}(UUID:${message.author.id}, 最高権限: ${message.member.roles.highest.name})`);
};

// WebGUIメイン処理
const app = express();

const currentSettions = {};

const sendLog = async (text) => {
    const channel = client.channels.cache.get('645499007166185512');
    await channel.send(text);
}

class session {
    constructor(uuid) {
        this.createDate = new Date();
        this.uuid = uuid;
        setTimeout(() => {
            delete currentSettions[this.uuid];
        }, 1000 * 60 * 10)
    }
}

app.use(basicAuth({
    challenge: true,
    unauthorizedResponse: () => {
        return '認証に失敗しました';
    },
    authorizer(username, password) {
        if ((!username || !password) || !users[username]) {
            return false;
        }
        const isAuthPassed = basicAuth.safeCompare(password, Buffer.from(users[username], 'base64').toString());
        return isAuthPassed;
    }
}))

app.use(express.static(path.join(__dirname, 'webgui')));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

app.get('/', async (req, res) => {
    const newUuid = v4();
    currentSettions[newUuid] = new session(newUuid);
    res.redirect(`/gui?uuid=${newUuid}`);
});

app.get('/logout', async (req, res) => {
    res.set('WWW-Authenticate', 'Basic realm="Yuichan-WebGUI"');
    res.sendStatus(401);
});

app.get('/gui', async (req, res) => {
    res.sendFile(__dirname + '/webgui/gui/index.html');
});

app.get('/api/get/msg', async (req, res) => {
    const msgId = req.query.i;
    const chId = req.query.ci;
    const msg = await client.channels.cache.get(chId).messages.fetch(msgId);
    const embed = msg.embeds[0];
    const data = {
        msgId: msg.id,
        chId: msg.channel.id,
        content: embed.description,
        title: embed.title,
        everyone: msg.content === '@everyone' ? true : false,
    };
    res.json(data);
});

app.post('/api/post/notify', async (req, res) => {
    data = req.body;
    systemLog.info(`/api/post/notify POST: ${req.auth.user}/${data.uuid}`);
    if (!currentSettions[data.uuid]) {
        res.json({
            status: 'NG',
            reason: 'InvalidUUID'
        });
        systemLog.error(`無効なUUID: ${data.uuid}`)
        return;
    }
    else {
        const channel = client.channels.cache.get(NOTIFY_CH);
        const embed = {
            title: data.title,
            color: 0xcf5353,
            timestamp: new Date,
            description: data.text,
            footer: {
                text: 'Krunker日本公式交流',
                icon_url: 'https://cdn.discordapp.com/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
            },
        }
        await channel.send(data.everyone ? '@everyone' : null, { embed: embed }).catch(err => { systemLog.error(err); });
        sendLog(`お知らせ送信: ${req.auth.user}`);
        res.json({
            status: 'OK'
        });
        return
    }
});

app.post('/api/post/update', async (req, res) => {
    data = req.body;
    systemLog.info(`/api/post/update POST: ${req.auth.user}/${data.uuid}`);
    if (!currentSettions[data.uuid]) {
        res.json({
            status: 'NG',
            reason: 'InvalidUUID'
        });
        systemLog.error(`無効なUUID: ${data.uuid}`)
        return;
    }
    else {
        if (data.mode === 'newPost') {
            const channel = client.channels.cache.get(UPDATE_CH);
            const embed = {
                title: `Krunker v${data.version} - ${data.date}`,
                color: 0xcf5353,
                timestamp: new Date,
                description: data.text,
                footer: {
                    text: 'Krunker日本公式交流',
                    icon_url: 'https://media.discordapp.net/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                },
            }
            const message = await channel.send('', { embed: embed }).catch(err => { systemLog.error(err); });
            message.crosspost();
            sendLog(`アップデート情報送信: ${req.auth.user}`);
            res.json({
                status: 'OK'
            });
        }
        else if (data.mode === 'editPost') {
            const channel = client.channels.cache.get(data.chId);
            const embed = {
                title: data.title,
                color: 0xcf5353,
                timestamp: new Date,
                description: data.text,
                footer: {
                    text: 'Krunker日本公式交流',
                    icon_url: 'https://media.discordapp.net/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                },
            }
            channel.messages.fetch(data.msgId)
            .then(msg => {
                msg.edit(data.everyone ? '@everyone' : null, { embed: embed }).catch(err => { systemLog.error(err); });
                sendLog(`メッセージ編集: ${req.auth.user}/${data.msgId}`);
            })
            res.json({
                status: 'OK'
            });
        }
        return
    }
});

const talk = () => {
    try {
        message = DATA.MSG_QUEUE[0];
        let text = message.content.replace(/\n/g, ' ')
        .replace(/http(s):\/\/.*/g, 'ゆーあーるえるしょうりゃく')
        .replace(/www\..+.+/g, 'ゆーあーるえるしょうりゃく')
        .replace(/\\/g, 'バックスラッシュ')
        .replace(/(w|ｗ)+$/g, 'わらわら')
        .replace(/(K|k)(runker)/g, 'くらんかー')
        .replace(/(K|k|Ｋ|ｋ)るんけ(R|r|Ｒ|ｒ)/g, 'くらんかー')
        .replace(/原神/g, 'げんしん')
        .replace(/(`|```|~~)/g, '')
        .replace(/\|\|.+\|\|/g, 'ネタバレ')
        .replace(/<(@|@&|#).*>/g, '')
        .replace(/<:.+:[0-9]+>/g, '');
        if (text.length > 50) {
            text = text.slice(0,49) + ' 以下略';
        }
        if (text === '' || text.match(/^\s*$/) || text.match(/^[！-／：-＠［-｀｛-～、-〜”’・]+$/) || text.match(/^[!-/:-@[-`{-~]+$/)) {
            DATA.MSG_QUEUE.shift();
            if (DATA.MSG_QUEUE.length > 0) {
                talk()
            }
            else {
                return;
            }
        };
        let fixedText = '';
        Object.values(text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || []).forEach((c) => {
            if (c in emojiList) {
                fixedText += emojiList[c].short_name;
            }
            else {
                fixedText += c;
            }
        });
        fixedText = romajiConv(fixedText).toHiragana();
        /* For Debugging
        console.log(fixedText);
        DATA.MSG_QUEUE.shift();
        if (DATA.MSG_QUEUE.length > 0) talk();
        */
        const path = tts.generateWav(fixedText);
        if (!path) {
            DATA.MSG_QUEUE.shift();
            if (DATA.MSG_QUEUE.length > 0) {
                talk();
            }
            else {
                return;
            }
        };
        const player = DATA.TTS[2].play(path);
        player.on('finish', () => {
            DATA.MSG_QUEUE.shift();
            tts.deleteWav(path);
            player.destroy();
            if (DATA.MSG_QUEUE.length > 0) talk();
        })
    }
    catch (error) {
        systemLog.fatal(error);
        message.channel.send('テキストの読み上げに失敗しました!ごめんなさい!');
    }
    return;
};

// イベントハンドラ
client.on('ready', () => {
    systemLog.info(`ゆいちゃん v${packageInfo.version} 起動完了`);
    systemLog.info(`ログイン成功: ${client.user.tag}(UUID:${client.user.id})`);
    app.listen(10000, () => systemLog.info('Webサーバーが開始されました: http://hiroqss.com:' + 10000));
    client.user.setActivity(`${PREFIX}help | v${packageInfo.version}`);
});

client.on('message', async (message) => {
    if (!message.content || message.author.bot) return;
    if (message.channel.id === DATA.TTS[0] && !message.content.startsWith(PREFIX)) {
        if (DATA.MSG_QUEUE.length === 0) {
            DATA.MSG_QUEUE.push(message);
            talk();
        }
        else {
            DATA.MSG_QUEUE.push(message);
        }
    }
    if (message.channel.id === '895638310603595806' && message.content !== 'dc.verify') {
        const reply = await message.reply('`dc.verify` で認証することが出来ます。')
        setTimeout(async () => {
            await message.delete();
            await reply.delete();
        }, 10000);
    }
    if (message.content.match(/https?:\/\/discord(app)?.com\/channels(\/[0-9]{18}){3}/)) {
        // URLをパースする
        [guildId, channelId, messageId] = message.content.match(/https?:\/\/discord(app)?.com\/channels(\/[0-9]{18}){3}/)[0].split('/').slice(-3)
        if (guildId === message.guild.id) {
            client.channels.cache.get(channelId).messages.fetch(messageId)
            .then(async (msg) => {
                await message.channel.send({
                    embed: {
                        color: 0xcf5353,
                        author: {
                            name: msg.member.displayName ?? msg.member.nickname,
                            icon_url: msg.author.avatarURL()
                        },
                        description: msg.content,
                        timestamp: msg.createdTimestamp,
                        footer: {
                            text: `${msg.guild.name} | #${msg.channel.name}`,
                            icon_url: msg.guild.iconURL()
                        }
                    }
                })
            })
            .catch(async (e) => {
                systemLog.fatal(e)
                await message.react('❌');
            })
        }
    }
});

client.on('message', async (message) => {
    if (!message.content || message.author.bot || !message.content.startsWith(PREFIX)) return;
    const userHighestRole = message.member.roles.highest.name;
    const userPermission = permissionLevel.includes(userHighestRole) ? userHighestRole : '@everyone';
    const cmd = message.content.split(' ')[0];
    const args = message.content.split(' ').splice(1);
    Object.keys(commands.commands).forEach(async (k) => {
        const tmp = PREFIX + k;
        if (tmp === cmd) {
            if (permissionLevel.indexOf(userPermission) >= permissionLevel.indexOf(commands.commands[k].permission)) {
                switch (commands.commands[k].type) {
                    case 'text':
                        // テキスト送信のみのコマンド
                        message.channel.send(commands.commands[k].text);
                        break;
                    case 'embed':
                        // embed送信コマンド
                        message.channel.send({
                            embed: commands.commands[k].embed,
                        });
                        break;
                    case 'exec':
                        // ソースコード実行コマンド
                        await commands.commands[k].execute(client, message, systemLog, args);
                        break;
                    case 'tts':
                        // tts用コマンド
                        const result = await commands.commands[k].execute(client, message, systemLog, args);
                        DATA[result.id] = result.value;
                        if (result.value[2]) {
                            DATA.INTERVAL = setInterval(async () => {
                                const tChannel = client.guilds.cache.get('477748107782914058').channels.cache.get(DATA.TTS[0]);
                                const me = client.guilds.cache.get('477748107782914058').members.cache.get(process.argv[2] === '--debug' ? '888951451789975614' : '837933813149204480')
                                if (!me.voice.channel) {
                                    clearInterval(DATA.INTERVAL);
                                    DATA.TTS = [null, null, null]
                                }
                                else if (me.voice.channel.members.size == 1) {
                                    clearInterval(DATA.INTERVAL);
                                    me.voice.channel.leave();
                                    await tChannel.send({
                                        embed: {
                                            title: 'VCから切断しました',
                                            color: 0xff0000,
                                            timestamp: new Date,
                                            description: `誰も居なくなっちゃったよ><`,
                                            thumbnail: {
                                                url: 'https://cdn.discordapp.com/attachments/918062537558327306/919539558423601172/download20211200193224.png',
                                            },
                                            footer: {
                                                text: 'Krunker日本公式交流',
                                                icon_url: 'https://cdn.discordapp.com/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                                            },
                                        }
                                    });
                                    DATA.TTS = [null, null, null]
                                }
                            }, 1000)
                        }
                        else {
                            clearInterval(DATA.INTERVAL);
                            DATA.TTS = [null, null, null]
                        }
                        break;
                }
            }
            else {
                message.reply('あなたはこのコマンドを実行するのに必要な権限を持っていません。');
                permissionError(message, commands.commands[k].permission);
            }
        }
    });
});

// Compチャンネル管理
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

setInterval(async () => {
    fs.readdir('./img/avatar/', (err, files) => {
        if (err) systemLog.error(err);
        const num = Math.round(Math.random() * (files.length));
        client.user.setAvatar(`./img/avatar/${files[num - 1]}`)
        .catch(err => systemLog.error(err));
    })
}, 1000 * 60 * 30);

setInterval(() => {
    const date = new Date();
    const day = date.getDay();
    const hour = date.getHours();
    const min = date.getMinutes();
    if (day === 5 && hour === 9 && min === 0) {
        Object.values(compChs).forEach(async (v) => {
            try {
                await client.channels.cache.get(v).overwritePermissions(openPermission);
            }
            catch (e) {
                systemLog.fatal('実行時エラー: チャンネル権限のオーバーライドに失敗しました');
                systemLog.fatal(e);
            }
        });
    }
    else if (day === 1 && hour === 9 && min === 0) {
        Object.values(compChs).forEach(async (v) => {
            try {
                await client.channels.cache.get(v).overwritePermissions(closePermission);
            }
            catch (e) {
                systemLog.fatal('実行時エラー: チャンネル権限のオーバーライドに失敗しました');
                systemLog.fatal(e);
            }
        });
    }
}, 60000);