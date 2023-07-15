import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { Logger } from 'log4js';
import { defaultEmbed } from '../lib/utils';

module.exports = {
    name: 'MessagePreview',
    description: 'メッセージをプレビューできます',
    disable: false,
    execute: async function(client: Client, log: Logger) {
        client.on('messageCreate', async (message) => {
            if (!message.content || message.author.bot) return;
            if (message.channel.id === '895638310603595806') {
                const reply = await message.reply(
                    '`/verify`コマンドで認証することが出来ます。'
                );
                setTimeout(async () => {
                    await message.delete();
                    await reply.delete();
                }, 10000);
                return;
            }
            const regex = /https?:\/\/discord(app)?.com\/channels(\/[0-9]{18,21}){3}/;
            if (message.content.match(regex)) {
                const [guildId, channelId, messageId] = message.content
                    .match(regex)![0]
                    .split('/')
                    .slice(-3);
                const channel = client.channels.cache.get(
                    channelId
                ) as TextChannel;
                try {
                    const previewMessage = await channel.messages.fetch(
                        messageId
                    );
                    const content = previewMessage.content;
                    const embeds = previewMessage.embeds;
                    await message.channel.send({
                        embeds: [
                            {
                                color: 0xcf5353,
                                author: {
                                    name: previewMessage.author.tag,
                                    icon_url:
                                        previewMessage.author.avatarURL() ||
                                        undefined,
                                },
                                description: content,
                                timestamp: previewMessage.createdTimestamp,
                                footer: {
                                    text: `${previewMessage.guild?.name} | #${channel.name}`,
                                    icon_url:
                                        previewMessage.guild?.iconURL() ||
                                        undefined,
                                },
                            },
                        ],
                    });
                    if (embeds.length) {
                        await message.channel.send({
                            embeds: embeds,
                        });
                    }
                } catch (e) {
                    log.fatal(e);
                    await message.react('❌');
                }
            }
        });
        return;
    },
};
