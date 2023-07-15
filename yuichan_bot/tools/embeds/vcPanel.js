const { MessageOptions, MessageActionRow, Message, MessageButton } = require('discord.js');
const packageInfo = require('../../package.json');

const createButton = new MessageButton()
    .setCustomId('CREATE_VC')
    .setEmoji('➕')
    .setStyle('SUCCESS')
    .setLabel('新しく作成');

module.exports = {
    // channelId: '845426896946200576', // #テスト用
    channelId: '952785553332531300', // #パーティーvc操作 
    /**
     * @type { MessageOptions }
     */
    messageOptions: {
        embeds: [
            {
                title: 'パーティーVC操作パネル',
                color: 0xffbe30,
                timestamp: new Date(),
                description:
                    '**新しいVCと専用の聞き専チャンネルを作成することができます！**\n\n' +
                    '> __**使い方**__\n' +
                    '1. `➕新しく作成`を押す\n' +
                    '2. 作成したVCと聞き専を使う！\n' +
                    '3. 使い終わったら、聞き専チャンネルにある`🗑️削除`を押して削除する\n\n' +
                    '> __**⚠注意⚠**__\n' +
                    '- VCに参加している人数が0人になってから5分経過すると自動で削除されます。',
                footer: {
                    text: 'あぺもば！ | #パーティーvc作成',
                    icon_url: 'https://cdn.discordapp.com/avatars/845082551960862731/cae81e4b2a43e46eb9ee87e96ceb717a.webp',
                },
            },
        ],
        components: [
            new MessageActionRow().addComponents(createButton),
        ],
    },
};