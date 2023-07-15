/* eslint-disable @typescript-eslint/no-var-requires */
import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'node-config-ts';
import { configure, getLogger } from 'log4js';
import * as mysql from 'mysql';
import { readdirSync } from 'fs';
import path from 'path';

// パッケージ情報
const packageInfo = require('../package.json');
// DBの認証情報
const cert = require('../cert.json');

// ロガーの設定
configure({
    appenders: {
        // コンソール
        consoleLog: {
            type: 'console',
        },
        // ログファイル
        system: {
            type: 'file',
            filename: 'logs/system.log',
        },
    },
    categories: {
        default: {
            appenders: ['consoleLog', 'system'],
            level: 'trace',
        },
    },
});

// ロガー
const log = getLogger('default');

log.info(`ゆいちゃん@KPD v${packageInfo.version}`);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,
    ],
});

// データベースObj
const db = mysql.createConnection({
    host: cert.host,
    user: cert.user,
    password: cert.password,
    database: cert.database,
});

client.once('ready', () => {
    log.info(`ログイン成功: ${client.user?.tag}(UID: ${client.user?.id})`);

    // DBの接続処理
    db.connect((err) => {
        if (err) {
            log.error(err);
        }
        log.info(`DBに接続しました: ${cert.host}`);
    });

    Object.values(readdirSync(path.join(__dirname, 'plugins'))).forEach(
        async (v: string) => {
            if (v.endsWith('.map')) return;
            const plugin = require(path.join(__dirname, `plugins/${v}`));
            if (!plugin.disable) {
                log.info(
                    `Plugin: ${plugin.name}(${plugin.description})を初期化中…`
                );
                await plugin.execute(client, log, db);
                log.info(`Plugin: ${plugin.name}の初期化が完了しました`);
            }
        }
    );
});

client.on('error', (err) => {
    log.error(err);
});

client.login(config.token);
