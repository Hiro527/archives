import {
    Client,
    Message,
    MessageEmbed,
    MessageEmbedOptions,
    NewsChannel,
    TextChannel,
} from 'discord.js';
import { Logger } from 'log4js';
import { defaultEmbed, getVersion } from '../lib/utils';
import express from 'express';
import bodyParser from 'body-parser';
import { config } from 'node-config-ts';
import path from 'path';
import helmet from 'helmet';
import { v4 } from 'uuid';
import { User, UsersList } from '../@types/types';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

module.exports = {
    name: 'APIHandler',
    description: 'APIハンドラ',
    disable: false,
    execute: async function(client: Client, log: Logger) {
        const GUILD = client.guilds.cache.get(config.guildId)!;
        const NOTIFY_CH = GUILD.channels.cache.get(
            config.notifyCh
        ) as TextChannel;
        const UPDATE_CH = GUILD.channels.cache.get(
            config.updateCh
        ) as NewsChannel;
        const LOG_CH = GUILD.channels.cache.get(config.logCh) as TextChannel;
        const app: express.Express = express();
        let currentSessions: { [index: string]: Session } = {};
        if (!existsSync(path.join(__dirname, '../../tmp'))) {
            mkdirSync(path.join(__dirname, '../../tmp'));
        }
        // レスポンスコード
        const HTTP_OK = 200;
        const HTTP_BADREQUEST = 400;
        const HTTP_UNAUTHORIZED = 401;
        const HTTP_FORBIDDEN = 403;
        const HTTP_INTERNALERROR = 500;
        // Basic認証用ユーザー
        const users: UsersList = {
            hiro527: {
                k: 'OspGXeyUeS',
                p: 'admin',
            },
            hassich: {
                k: 'FRzAdTMCrA',
                p: 'admin',
            },
            namekuji: {
                k: 'QiyGGOIjMU',
                p: 'admin',
            },
            ume416: {
                k: 'KMTZxQfjrx',
                p: 'admin',
            },
            masagure: {
                k: 'PYWsj9SPS7',
                p: 'admin',
            },
            zenomsoldark: {
                k: 'J0PbIxph4P',
                p: 'user',
            },
            jin: {
                k: 'OGysD8bEKU',
                p: 'user',
            },
        };
        let userttokens: string[] = [];
        Object.keys(users).forEach((k) => {
            userttokens.push(
                Buffer.from(`${k}:${users[k].k}`).toString('base64')
            );
        });

        // ログメッセージの送信
        const sendLog = async (
            username: string,
            action: string,
            description: string
        ) => {
            const user = users[username];
            await LOG_CH.send({
                embeds: [
                    defaultEmbed()
                        .setTitle('ゆいちゃん - アクションログ')
                        .addFields([
                            {
                                name: 'ユーザー',
                                value: `${username}(${user.p})`,
                            },
                            {
                                name: 'アクション',
                                value: action,
                            },
                            {
                                name: '詳細',
                                value: description,
                            },
                        ]),
                ],
            });
        };

        // セッション管理
        class Session {
            public uuid: string;
            public user: User;
            public username: string;
            constructor(username: string) {
                this.username = username;
                this.uuid = v4();
                this.user = users[username];
                setTimeout(() => {
                    delete currentSessions[username];
                }, 1000 * 60 * 30);
            }
        }

        // helmetを被らせておく(セキュリティポリシーは邪魔なので無効)
        app.use(
            helmet({
                contentSecurityPolicy: false,
            })
        );

        // Basic認証
        app.use((req, res, next) => {
            const auth = req.headers['authorization'] || '';
            if (
                !auth.startsWith('Basic ') ||
                !userttokens.some((user) => user == auth.substring(6))
            ) {
                res.set('WWW-Authenticate', 'Basic realm="YuiChan-WebGUI"');
                return res
                    .status(HTTP_UNAUTHORIZED)
                    .send('401 Unauthorized: ログインをやり直して下さい');
            }
            return next();
        });

        app.use(express.static(path.join(__dirname, '../../web')));
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(
            bodyParser.json({
                limit: '1024mb',
            })
        );

        app.get('/', async (req, res) => {
            const authHeader = Buffer.from(
                req.headers['authorization']?.substring(6) as string,
                'base64'
            )
                .toString()
                .split(':');
            const newSession = new Session(authHeader[0]);
            currentSessions[authHeader[0]] = newSession;
            res.redirect(`/app?u=${newSession.username}&si=${newSession.uuid}`);
        });

        app.get('/app', async (req, res) => {
            const authHeader = Buffer.from(
                req.headers['authorization']?.substring(6) as string,
                'base64'
            )
                .toString()
                .split(':');
            const username = authHeader[0];
            const session = currentSessions[username];
            if (!session) {
                res.status(HTTP_FORBIDDEN).send();
                await sendLog(username, 'アクセス拒否(`/app`)', '-');
                log.info(`/app: ${username} / アクセス拒否`);
                return;
            }
            res.sendFile(path.join(__dirname, '../../web/app/index.html'));
        });

        app.get('/api/v2/info', async (req, res) => {
            const responseBody = {
                version: getVersion(),
            };
            res.send(responseBody);
        });

        app.get('/api/v2/permission', async (req, res) => {
            const authHeader = Buffer.from(
                req.headers['authorization']?.substring(6) as string,
                'base64'
            )
                .toString()
                .split(':');
            const username = authHeader[0];
            const uuid = req.query.si;
            const session = currentSessions[username];
            if (session && session.uuid === uuid) {
                res.status(HTTP_OK).send({
                    user: username,
                    uuid: uuid,
                    permission: session.user.p,
                });
            } else {
                res.status(HTTP_BADREQUEST).send();
            }
        });

        app.get('/api/v2/get', async (req, res) => {
            const authHeader = Buffer.from(
                req.headers['authorization']?.substring(6) as string,
                'base64'
            )
                .toString()
                .split(':');
            const username = authHeader[0];
            const session = currentSessions[username];
            const uuid = req.query.si;
            const channelId = req.query.ci as string;
            const messageId = req.query.mi as string;
            let message: Message;
            let responseBody;
            if (
                !session ||
                session.uuid !== uuid ||
                (channelId === NOTIFY_CH.id && session.user.p !== 'admin')
            ) {
                res.status(HTTP_FORBIDDEN).send();
                await sendLog(
                    username,
                    'アクセス拒否(`/api/v2/get`)',
                    `該当メッセージ: [開く](https://discord.com/channels/${config.guildId}/${channelId}/${messageId})`
                );
                log.info(`/api/v2/get: ${username} / アクセス拒否`);
                return;
            }
            try {
                message = await (client.channels.cache.get(
                    channelId
                ) as TextChannel).messages.fetch(messageId);
                responseBody = {
                    content: message.content,
                    embeds: JSON.stringify(message.embeds),
                };
            } catch (e) {
                res.status(HTTP_INTERNALERROR).send();
                log.error(e);
                return;
            }
            res.status(HTTP_OK).send(JSON.stringify(responseBody));
            await sendLog(
                username,
                'メッセージ取得(`/api/v2/get`)',
                `取得先メッセージ: [開く](https://discord.com/channels/${config.guildId}/${channelId}/${messageId})`
            );
            log.info(
                `/api/v2/get: ${username} / ${message.channelId}-${message.id}`
            );
        });

        app.post('/api/v2/post', async (req, res) => {
            const authHeader = Buffer.from(
                req.headers['authorization']?.substring(6) as string,
                'base64'
            )
                .toString()
                .split(':');
            const username = authHeader[0];
            const session = currentSessions[username];
            const uuid = req.body.uuid;
            if (!session || session.uuid !== uuid) {
                res.status(HTTP_FORBIDDEN).send();
                await sendLog(username, 'アクセス拒否(`/api/v2/post`)', '-');
                log.info(`/api/v2/post: ${username} / アクセス拒否`);
                return;
            }
            let message;
            // ファイルの処理
            const embed: MessageEmbed = new MessageEmbed(req.body.embeds[0]);
            const files: { [index: string]: [string, string] } = req.body.files;
            const attachments: any[] = [];
            Object.keys(files).forEach((k) => {
                const fname = path.join(`${__dirname}/../../tmp`, k);
                const data = Buffer.from(files[k][1], 'base64');
                writeFileSync(fname, data);
                switch (files[k][0]) {
                    case 'thumbnail':
                        embed.setThumbnail(`attachment://${k}`);
                        attachments.push({
                            attachment: fname,
                            name: k,
                        });
                        break;
                    case 'image':
                        embed.setImage(`attachment://${k}`);
                        attachments.push({
                            attachment: fname,
                            name: k,
                        });
                        break;
                    case 'attachment':
                        attachments.push(fname);
                        break;
                }
            });
            switch (req.body.mode) {
                case 'edit':
                    try {
                        const ids = req.body.sendto.match(/[0-9]{18,21}/g);
                        if (
                            ids[1] === NOTIFY_CH.id &&
                            session.user.p !== 'admin'
                        ) {
                            res.status(HTTP_FORBIDDEN).send();
                            await sendLog(
                                username,
                                'アクセス拒否(`/api/v2/post.edit`)',
                                `該当メッセージ: [開く](${req.body.sendto})`
                            );
                            log.info(
                                `/api/v2/post.edit: ${username} / アクセス拒否`
                            );
                            return;
                        }
                        const guild = client.guilds.cache.get(ids[0]);
                        const channel = guild?.channels.cache.get(ids[1]);
                        if (
                            channel instanceof TextChannel ||
                            channel instanceof NewsChannel
                        ) {
                            message = channel.messages.cache.get(ids[2]);
                        } else {
                            throw Error('メッセージの取得に失敗しました');
                        }
                        await message?.edit({
                            content: req.body.content || undefined,
                            embeds: [embed],
                            files: attachments,
                        });
                        log.info(
                            `/api/v2/post: ${username} / ${message?.channelId}-${message?.id}`
                        );
                        await sendLog(
                            username,
                            'メッセージ編集(`/api/v2/post.edit`)',
                            `編集したメッセージ: [開く](https://discord.com/channels/${config.guildId}/${message?.channelId}/${message?.id})`
                        );
                    } catch (e) {
                        res.status(HTTP_INTERNALERROR).send();
                        log.error(e);
                        return;
                    }
                    break;
                default: {
                    let channel;
                    if (
                        req.body.mode === 'notify' &&
                        session.user.p === 'admin'
                    ) {
                        channel = NOTIFY_CH;
                    } else if (req.body.mode === 'update') {
                        channel = UPDATE_CH;
                    } else {
                        res.status(HTTP_FORBIDDEN).send();
                        await sendLog(
                            username,
                            'アクセス拒否(`/api/v2/post`)',
                            '-'
                        );
                        log.info(`/api/v2/post: ${username} / アクセス拒否`);
                        return;
                    }
                    try {
                        message = await channel.send({
                            content: req.body.content || undefined,
                            embeds: [embed],
                            files: attachments,
                        });
                        if (message.crosspostable) message.crosspost();
                    } catch (e) {
                        res.status(HTTP_INTERNALERROR).send();
                        log.error(e);
                        return;
                    }
                    log.info(
                        `/api/v2/post: ${username} / ${message.channelId}-${message.id}`
                    );
                    await sendLog(
                        username,
                        'メッセージ送信(`/api/v2/post`)',
                        `送信したメッセージ: [開く](https://discord.com/channels/${config.guildId}/${message?.channelId}/${message?.id})`
                    );
                    break;
                }
            }
            res.status(HTTP_OK).send();
        });

        app.listen(80, () => log.info('Webサーバーが開始されました'));
        return;
    },
};
