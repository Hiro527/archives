import { Client, MessageEmbed } from "discord.js";
import { Logger } from "log4js";
import { config } from "node-config-ts";
import { defaultEmbed, getVersion } from "../lib/utils";
import { readdir } from "fs";
import path from "path";
const packageInfo = require("../../package.json");

module.exports = {
    name: "IntervalManager",
    description: "各種インターバルの管理",
    disable: false,
    execute: async function(client: Client, log: Logger) {
        let activityFlag = true;
        const me = client.user!;
        const guild = client.guilds.cache.get(config.guildId)!;
        guild.members.fetch();
        setInterval(() => {
            if (activityFlag) {
                me.setActivity(
                    `${config.prefix}help | ${getVersion()}`
                );
            } else {
                me.setActivity(
                    `現在${
                        guild.members.cache.filter(
                            (member) =>
                                !member.user.bot &&
                                member.roles.cache.some(
                                    (role) => role.id === "895638609456136202"
                                ) &&
                                member.presence?.status !== "offline"
                        ).size
                    }人がオンラインです`
                );
            }
            activityFlag = !activityFlag;
        }, 15 * 1000);
        setInterval(async () => {
            readdir(
                path.join(__dirname, "../../assets/avatar/"),
                (err, files) => {
                    if (err) log.error(err);
                    const num = Math.round(Math.random() * files.length);
                    me.setAvatar(
                        `${path.join(__dirname, "../../assets/avatar/")}${
                            files[num - 1]
                        }`
                    ).catch((err) => log.error(err));
                }
            );
        }, 1000 * 60 * 30);
        return;
    },
};
