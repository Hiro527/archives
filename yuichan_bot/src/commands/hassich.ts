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
import { defaultEmbed } from '../lib/utils';

module.exports = {
    name: "hassich",
    permission: "everyone",
    help: "hassich",
    disable: false,
    hidden: true,
    args: {
        must: [],
        optional: []
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
        const messages =[
            'はしっちﾁｬﾝ、会社をサボるなんて、悪い子だなぁ😃☀ ❗(^o^)😍今日はどんな一日だッタ😜⁉️✋❓🤔おじさんははしっちﾁｬﾝ一筋だ、よ😎（￣▽￣）💤🙂😤',
            'はしっちチャン😃♥ 😃☀ 元気、ないのかなぁ😰大丈夫❗❓✋❓🤔😜⁉️⁉僕は、すごく心配だ、よ💦(￣Д￣；；😱そんなときは、美味しいもの食べて、元気出さなきゃ、だね💕🎵💗(^з<)',
            'あれ(・_・;😱(￣Д￣；；(^_^;はしっちちゃん、朝と夜間違えたのかな❗❓🤔😜⁉️（￣ー￣?）⁉オレはまだ起きてますよ〜😘😃✋😚😆❗はしっちちゃんと今度イチャイチャ、したいナァ💕😃💗😄そろそろご飯行こうよ😄(^_^)(^o^)ご要望とかはあるのかな😃✋(^o^)😍😜⁉️',
            'はしっちちゃん、お疲れ様〜😘😄😃✋😃はしっちちゃんにとって素敵な1日になります、ようニ😃♥ ',
            'はしっちちゃん、こんな遅い時間✋😴🛌(＃￣З￣)😎に何をしているのかな😜⁉️✋❓（￣ー￣?）❓🤔ちょっと電話できるかナ😜⁉️❓⁉（￣ー￣?）❗❓今日はよく休んでネ💤(^^;;'
        ]
        await channel.send(messages[Math.round(Math.random() * messages.length) - 1])
        return;
    },
};
