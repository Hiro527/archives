const  { execSync } = require('child_process');
const { v4 } = require('uuid');
const fs = require('fs');
const { stderr } = require('process');

module.exports = class {
    constructor(systemLog) {
        this.systemLog = systemLog;
    }
    generateWav(text) {
        const uuid = v4();
        execSync(`echo '${text}' | open_jtalk -r 1.0 -m /usr/share/hts-voice/tohoku-f01/tohoku-f01-neutral.htsvoice -x /var/lib/mecab/dic/open-jtalk/naist-jdic -ow /home/hiro/ttsTemp/${uuid}.wav`, (error, stdout, stderr) => {
            if (!error) {
                this.systemLog.error(`実行エラー: ${error}`);
                return null;
            }
        });
        return `/home/hiro/ttsTemp/${uuid}.wav`;
    }
    deleteWav(path) {
        fs.unlink(path, err => {
            if (err) throw err;
        });
    }
}