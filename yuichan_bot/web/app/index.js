const urlBase = document.domain;
const userInfo = {};
const files = {};


window.onload = () => {
    const query = location.search.slice(1);
    query.split('&').forEach((k) => {
        const temp = k.split('=');
        userInfo[temp[0]] = temp[1];
    });
    if (urlBase === '127.0.0.1') {
        userInfo.permission = 'admin';
        setupUI();
        return;
    }
    fetch(`http://${urlBase}/api/v2/info`, {
        method: 'GET',
    }).then((res) => res.json())
    .then((data) => {
        $('#versionLabel').text(data.version);
    }).catch((e) => {
        alert(e.toString());
        location.href = `http://${urlBase}/`;
    });
    fetch(`http://${urlBase}/api/v2/permission?si=${userInfo.si}`, {
        method: 'GET',
    }).then((res) => {
        if (res.status === 400) {
            throw Error('ユーザーデータが不正です');
        }
        return res.json();
    }).then((data) => {
        userInfo.permission = data.permission;
        setupUI();
    }).catch((e) => {
        alert(e.toString());
        location.href = `http://${urlBase}/`;
    });
};


/**
 * UIをセットアップします
 * @param {JQuery<HTMLElement>} appUI 
 */
const setupUI = () => {
    $('#loadingUI').hide();
    $('#navbarDropdown').after(`
    <ul class="dropdown-menu" id="dropdownMenu" area-labelledby="navbarDropdown">
        ${userInfo.permission === 'admin' ? '<li><a class="dropdown-item" id="notifyBtn">お知らせ</a></li>' : ''}
        <li><a class="dropdown-item" id="updateBtn">アップデート情報</a></li>
    </ul>`);
    $('#notifyBtn').on('click', () => showNotifyUI());
    $('#updateBtn').on('click', () => showUpdateUI());
    $('#editBtn').on('click', () => showEditUI());
    if (userInfo.permission === 'admin') {
        showNotifyUI();
    }
    else {
        showUpdateUI();
    }
};


const sendPost = () => {
    if (!confirm('内容に誤りがないことを確認しましたか？')) {
        return;
    }
    const reqBody = {
        uuid: userInfo.si,
        mode: $('#modeLabel').text(),
        sendto: $('#msgUrl').val(),
        content: $('#postEveryone').prop('checked') ? '@everyone' : $('#postCont').val() || '',
        embeds: [
            {
                title: $('#postTitle').val(),
                description: $('#postDesc').val(),
                color: '#cf5353',
                footer: {
                    text: 'Krunker.io日本公式交流Discord',
                    icon_url:
                        'https://media.discordapp.net/attachments/789856068649615390/810124789934850098/KrunkerJP.png',
                },
                timestamp: new Date(),
            },
        ],
        files: files,
    };
    fetch(`http://${urlBase}/api/v2/post`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqBody),
    }).then((res) => {
        if (res.status === 500) {
            throw Error('サーバーの内部エラーが発生しました');
        }
        else if (res.status === 403) {
            throw Error('アクセス権限がありません');
        }
        else {
            alert('正常に送信されました');
        }
    }).catch((e) => {
        alert(e.toString());
    });
};


const getPost = () => {
    const ids = $('#msgUrl').val().match(/[0-9]{18,21}/g);
    fetch(`http://${urlBase}/api/v2/get?si=${userInfo.si}&ci=${ids[1]}&mi=${ids[2]}`, {
        method: 'GET',
    }).then((res) => {
        if (res.status === 500) {
            throw Error('サーバーの内部エラーが発生しました');
        }
        else if (res.status === 403) {
            throw Error('アクセス権限がありません');
        }
        return res.json();
    }).then((data) => {
        data.embeds = JSON.parse(data.embeds);
        $('#postTitle').val(data.embeds[0].title);
        $('#postCont').val(data.content);
        $('#postDesc').val(data.embeds[0].description);
        $('#msgUrl').prop('disabled', true);
        $('#getMsgBtn').prop('disabled', true);
        Object.values(document.getElementsByClassName('editControls')).forEach((e) => {
            e.removeAttribute('disabled');
        });
    }).catch((e) => {
        alert(e.toString());
    });
};


/**
 * ファイルを読み込みます
 * @param {string} mode
 * @param {File} file 
 */
const loadFile = (mode, file) => {
    const fid = v4();
    const fname = `${fid}.${file.name.split('.').slice(-1)}`;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => {
        files[fname] = [mode, reader.result.replace(/data:.+\/.+;base64,/g, '')];
    });
    return fname;
};


/**
 * 
 * @param {HTMLInputElement} el 
 */
const fileUpdated = (el) => {
    const inputFilesEls = $('.inputFileHolder');
    const index = Number(inputFilesEls.last().children('input')[0].id.match(/[0-9]/g)) + 1;
    const file = el.files[0];
    const fname = loadFile(el.getAttribute('mode'), file);
    inputFilesEls.last().after(`
    <div style="height: 10px"></div>
    <div class="input-group inputFileHolder">
        <input type="text" class="form-control" id="postFile${index}" value="${file.name}" disabled>
        <button type="button" class="btn btn-outline-danger" for="postFile${index}" fname="${fname}" onclick="removeFile(this, 1)">削除</button>
    </div>
    `);
    el.value = '';
};


/**
 * ファイルの削除を処理します
 * @param {HTMLInputElement} el 
 * @param {Number} mode 
 */
const removeFile = (el, mode) => {
    const inputEl = $(`#${el.getAttribute('for')}`);
    delete files[el.getAttribute('fname')];
    switch (mode) {
        case 1:
            inputEl.parent().prev().remove();
            inputEl.parent().remove();
            break;
        case 2:
            inputEl.val('');
            break;
    }
};


const showNotifyUI = () => {
    $('#appUI').html(`
    <h1>お知らせを送信する</h1>
    <div id="modeLabel" style="display: none;">notify</div>
    <div class="appElements" id="titleInput">
        <label for="postTitle" class="form-label">タイトル</label>
        <input type="text" id="postTitle" class="form-control" placeholder="タイトルを入力">
    </div>
    <div class="appElements" id="descInput">
        <label for="postDesc" class="form-label">投稿内容</label>
        <textarea class="form-control" id="postDesc" placeholder="Markdown記法が使えます"></textarea>
    </div>
    <div class="appElements" id="imageInput">
        <label for="postThumb" class="form-label">サムネイル画像</label>
        <div class="input-group">
            <input type="file" accept="image/*" class="form-control" id="postThumb" onchange="$('#postThumbRm').attr('fname', loadFile('thumbnail', this.files[0]))">
            <button type="button" class="btn btn-outline-danger" id="postThumbRm" for="postThumb" onclick="removeFile(this, 2)">削除</button>
        </div>
        <div style="height: 10px"></div>
        <label for="postEmbedImg" class="form-label">埋め込み画像</label>
        <div class="input-group">
            <input type="file" accept="image/*" class="form-control" id="postEmbedImg" onchange="$('#postEmbedImgRm').attr('fname', loadFile('image', this.files[0]))">
            <button type="button" class="btn btn-outline-danger" id="postEmbedImgRm" for="postEmbedImg" onclick="removeFile(this, 2)">削除</button>
        </div>
    </div>
    <div class="appElements" id="fileInput">
        <label for="postFile1" class="form-label">添付ファイル</label>
        <div class="input-group inputFileHolder">
            <input type="file" class="form-control" id="postFile1" mode="attachment" onchange="fileUpdated(this);">
        </div>
    </div>
    <div class="appElements" id="controls">
        <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="postEveryone">
            <label class="form-check-label" for="postEveryone">everyoneメンション</label>
        </div>
        <div>
            <button type="button" class="btn btn-primary" id="submitBtn">送信</button>
        </div>
    </div>
    `);
    $('#submitBtn').on('click', () => sendPost());
};

const showUpdateUI = () => {
    $('#appUI').html(`
    <h1>アップデート情報を送信する</h1>
    <div id="modeLabel" style="display: none;">update</div>
    <div class="appElements" id="titleInput">
        <label for="postTitle" class="form-label">タイトル</label>
        <div class="input-group">
            <input type="text" id="postTitle" class="form-control" placeholder="タイトルを入力">
            <button class="btn btn-outline-secondary" type="button" id="templateBtn">テンプレ入力</button>
        </div>
    </div>
    <div class="appElements" id="descInput">
        <label for="postDesc" class="form-label">投稿内容</label>
        <textarea class="form-control" id="postDesc" placeholder="Markdown記法が使えます"></textarea>
    </div>
    <div class="appElements" id="imageInput">
        <label for="postThumb" class="form-label">サムネイル画像</label>
        <div class="input-group">
            <input type="file" accept="image/*" class="form-control" id="postThumb" onchange="$('#postThumbRm').attr('fname', loadFile('thumbnail', this.files[0]))">
            <button type="button" class="btn btn-outline-danger" id="postThumbRm" for="postThumb" onclick="removeFile(this, 2)">削除</button>
        </div>
        <div style="height: 10px"></div>
        <label for="postEmbedImg" class="form-label">埋め込み画像</label>
        <div class="input-group">
            <input type="file" accept="image/*" class="form-control" id="postEmbedImg" onchange="$('#postEmbedImgRm').attr('fname', loadFile('image', this.files[0]))">
            <button type="button" class="btn btn-outline-danger" id="postEmbedImgRm" for="postEmbedImg" onclick="removeFile(this, 2)">削除</button>
        </div>
    </div>
    <div class="appElements" id="fileInput">
        <label for="postFile1" class="form-label">添付ファイル</label>
        <div class="input-group inputFileHolder">
            <input type="file" class="form-control" id="postFile1" mode="attachment" onchange="fileUpdated(this);">
        </div>
    </div>
    <div class="appElements" id="controls">
        <div class="ms-auto me-0">
            <button type="button" class="btn btn-primary" id="submitBtn">送信</button>
        </div>
    </div>
    `);
    $('#submitBtn').on('click', () => sendPost());
    $('#templateBtn').on('click', () => {
        const now = new Date();
        $('#postTitle').val(`Krunker vX.Y.Z - ${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`);
    });
};

const showEditUI = () => {
    $('#appUI').html(`
    <h1>投稿を編集する</h1>
    <div id="modeLabel" style="display: none;">edit</div>
    <div class="appElements" id="urlInput">
        <label for="msgUrl" class="form-label">メッセージリンク</label>
        <div class="input-group">
            <input type="text" id="msgUrl" class="form-control" placeholder="メッセージのURLを入力">
            <button class="btn btn-outline-secondary" type="button" id="getMsgBtn">取得</button>
        </div>
    </div>
    <div class="appElements" id="titleInput">
        <label for="postTitle" class="form-label">タイトル</label>
        <input type="text" id="postTitle" class="form-control editControls" placeholder="タイトルを入力" disabled>
    </div>
    <div class="appElements" id="contentInput">
        <label for="postCont" class="form-label">コンテンツ</label>
        <input type="text" id="postCont" class="form-control editControls" placeholder="コンテンツを入力" disabled>
    </div>
    <div class="appElements" id="descInput">
        <label for="postDesc" class="form-label">投稿内容</label>
        <textarea class="form-control editControls" id="postDesc" placeholder="Markdown記法が使えます" disabled></textarea>
    </div>
    <div class="appElements" id="controls">
        <div class="ms-auto me-0">
            <button type="button" class="btn btn-primary editControls" id="submitBtn" disabled>送信</button>
        </div>
    </div>
    `);
    $('#getMsgBtn').on('click', () => getPost());
    $('#submitBtn').on('click', () => sendPost());
};


const v4 = () => {
    const chars = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.split('');
    for (let i = 0, len = chars.length; i < len; i++) {
        switch (chars[i]) {
            case 'x':
                chars[i] = Math.floor(Math.random() * 16).toString(16);
                break;
            case 'y':
                chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
                break;
        }
    }
    return chars.join('');
};