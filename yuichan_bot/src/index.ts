import { Client, Intents } from "discord.js";
import { configure, getLogger } from "log4js";
import { config } from "node-config-ts";
import { v4 } from "uuid";
import { readdirSync } from "fs";
import * as path from "path";
import { getVersion } from "./lib/utils";

const packageInfo = require("../package.json");

// ロガーの初期化
configure({
    appenders: {
        consoleLog: {
            type: "console",
        },
        system: {
            type: "file",
            filename: "logs/system.log",
        },
    },
    categories: {
        default: {
            appenders: ["consoleLog"],
            level: "trace",
        },
        SYSTEM: {
            appenders: ["system", "consoleLog"],
            level: "trace",
        },
    },
});
const log = getLogger("SYSTEM");

log.info(`ゆいちゃん ${getVersion()}`);

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES
    ]
});

const TOKEN: string = config.token;

client.once("ready", () => {
    log.info(`ログイン成功: ${client.user?.tag}(UserID: ${client.user?.id})`);
    client.user?.setActivity(`${config.prefix}help | ${getVersion()}`);
    // プラグインローダー
    Object.values(readdirSync(path.join(__dirname, "plugins"))).forEach(
        async (v: string) => {
            const plugin = require(path.join(__dirname, `plugins/${v}`));
            if (!plugin.disable) {
                log.info(
                    `Plugin: ${plugin.name}(${plugin.description})を初期化中…`
                );
                await plugin.execute(client, log);
                log.info(`Plugin: ${plugin.name}の初期化が完了しました`);
            }
        }
    );
});

client.on("error", (err) => {
    log.error(err);
});

client.login(TOKEN);
