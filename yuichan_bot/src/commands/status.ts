import {
    Client,
    Guild,
    GuildMember,
    Message,
    MessageEmbed,
    TextChannel,
    User,
} from "discord.js";
import { Logger } from "log4js";
import * as cp from "child_process";
import { defaultEmbed } from "../lib/utils";

module.exports = {
    name: "status",
    permission: "694200800603406416",
    help: "各種サービスのステータスを確認できます(副管理人以上)",
    disable: false,
    hidden: false,
    args: {
        must: [],
        optional: [],
    },
    execute: async function(
        client: Client,
        log: Logger,
        message: Message,
        args: [string]
    ) {
        const guild: Guild = message.guild!;
        const channel: TextChannel = message.channel as TextChannel;
        const author: User = message.author;
        const member: GuildMember = message.member!;
        const services = ["bot", "tts", "kpd"];
        const results: any = [];
        services.forEach((v) => {
            try {
                const stdout = cp
                    .execSync(`systemctl status yuichan_${v}`)
                    .toString();
                const lines = stdout.split("\n");
                results.push({
                    service: `yuichan_${v}`,
                    status: `${
                        lines[2].match(/running/) ? "**実行中**" : "**停止中**"
                    } / ${
                        lines[1].match(/; enabled;/)
                            ? "有効化済み"
                            : "有効化されていません"
                    }`,
                    pid: lines[3].match(/[0-9]{1,6}/)![0],
                    uptime: `<t:${Math.floor(
                        new Date(
                            lines[2].match(/since .{3} (.+) JST;/)![1]
                        ).getTime() / 1000
                    )}:R>`,
                    memory: lines[2].match(/running/)
                        ? lines[5].split(":")[1].substring(1)
                        : "-",
                });
            } catch (err) {
                log.error(err);
                results.push({
                    service: `yuichan_${v}`,
                    status: "取得できませんでした",
                    pid: "-",
                    uptime: "-",
                    memory: "-",
                });
            }
        });
        const systemStatus = {
            uptime: "",
            memory: "",
        };
        const stdout = cp.execSync("uptime -s && free -h").toString();
        const lines = stdout.split("\n");
        systemStatus.uptime = `<t:${Math.floor(
            new Date(lines[0]).getTime() / 1000
        )}:R>`;
        systemStatus.memory = `${lines[2].split(/\s+/)[2]} / ${
            lines[2].split(/\s+/)[1]
        }`;
        let statusText = `> **システム**
        連続稼働時間: ${systemStatus.uptime}
        使用済みメモリ: ${systemStatus.memory}
        `;
        const embed = defaultEmbed();
        results.forEach((v: any) => {
            statusText += `> **${v.service}**
            ステータス: ${v.status}
            PID: ${v.pid}
            メモリ: ${v.memory}
            連続稼働時間: ${v.uptime}
            `;
        });
        embed.setDescription(statusText);
        await channel.send({
            embeds: [embed],
        });
        return;
    },
};
