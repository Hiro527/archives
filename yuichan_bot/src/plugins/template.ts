import { Client, MessageEmbed } from "discord.js";
import { Logger } from "log4js";
import { defaultEmbed } from "../lib/utils";

module.exports = {
    name: "template",
    description:
        "このプラグインはテンプレート用のため、使用することは出来ません",
    disable: true,
    execute: async function(client: Client, log: Logger) {
        // Do something fun!
        return;
    },
};
