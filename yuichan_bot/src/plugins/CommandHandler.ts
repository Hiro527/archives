import {
    Client,
    Guild,
    GuildMember,
    Message,
    MessageEmbed,
    TextChannel,
    User,
} from "discord.js";
import { readdirSync } from "fs";
import { Logger } from "log4js";
import { config } from "node-config-ts";
import path from "path";
const packageInfo = require("../../package.json");
import { defaultEmbed, getVersion } from "../lib/utils";
import { Command } from "../@types/types";

const helpEmbed = new MessageEmbed()
    .setTitle("ゆいちゃんの使い方")
    .setColor(0xcf5353);

module.exports = {
    name: "CommandHandler",
    description: "コマンドハンドラ",
    disable: false,
    execute: async function(client: Client, log: Logger) {
        const PREFIX: string = config.prefix;
        const commands: { [name: string]: Command } = {};
        Object.values(readdirSync(path.join(__dirname, "../commands"))).forEach(
            (v: string) => {
                const command: Command = require(path.join(
                    __dirname,
                    `../commands/${v}`
                ));
                if (!command.disable) {
                    commands[command.name] = command;
                }
                if (!command.hidden) {
                    helpEmbed.addField(
                        `${PREFIX}${command.name}`,
                        command.help
                    );
                }
            }
        );
        client.on("messageCreate", async (message: Message) => {
            if (
                !message.content ||
                message.author.bot ||
                !message.content.startsWith(PREFIX)
            ) {
                return;
            }
            const guild: Guild = message.guild!;
            const channel: TextChannel = message.channel as TextChannel;
            const author: User = message.author;
            const member: GuildMember = message.member!;
            const command =
                commands[
                    message.content
                        .split(" ")[0]
                        .slice(PREFIX.length)
                        .toLowerCase()
                ];
            const args = message.content.split(" ").slice(1);
            if (command && !command.disable) {
                await channel.sendTyping();
                if (
                    member.roles.cache.some(
                        (role) => role.id === command.permission
                    ) ||
                    command.permission === "everyone"
                ) {
                    if (
                        args.length >= command.args.must.length &&
                        args.length <=
                            command.args.must.length +
                                command.args.optional.length
                    ) {
                        await command.execute(client, log, message, args);
                    } else {
                        const embed = defaultEmbed();
                        let argsTxt = `${PREFIX}${command.name}`;
                        Object.values(command.args.must).forEach((v) => {
                            argsTxt += ` [${v}]`;
                        });
                        Object.values(command.args.optional).forEach((v) => {
                            argsTxt += ` (${v})`;
                        });
                        embed
                            .setColor(0xff0000)
                            .setTitle("引数が不正です")
                            .setDescription(
                                `> __**コマンドの文法**__\n(\`[引数名]\`: 必須, \`(引数名)\`: 任意)\n\`\`\`${argsTxt}\`\`\`\n> __**コマンドの使い方**__\n${command.help}`
                            );
                        await channel.send({
                            embeds: [embed],
                        });
                    }
                } else {
                    const embed = defaultEmbed();
                    embed
                        .setColor(0xff0000)
                        .setTitle("権限が不足しています")
                        .setDescription(
                            "間違いであると考えられる場合は、管理者にお問い合わせください。"
                        );
                    await channel.send({
                        embeds: [embed],
                    });
                }
            } else if (
                message.content
                    .split(" ")[0]
                    .slice(PREFIX.length)
                    .toLowerCase() === "help"
            ) {
                helpEmbed
                    .setFooter({
                        text: `ゆいちゃん v${getVersion()}`,
                        iconURL: client.user?.avatarURL()!,
                    })
                    .setTimestamp(new Date());
                await channel.send({
                    embeds: [helpEmbed],
                });
            }

            return;
        });
        return;
    },
};
