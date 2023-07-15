const searchParams = new URLSearchParams(window.location.search);
$('#uuid').val(searchParams.get('uuid'));

$('#logoutBtn').click(() => {
    location.href = `${location.protocol}//${location.hostname}/logout`;
})

$('#notifyBtn').click(() => {
    $('#formHolder').html(`
    <h1 class="modeTitle">お知らせを送信</h1>
    <hr>
    <div class="itemContainer  col-sm-8 col-xl-5">
        <label for="title" class="form-label">タイトル</label>
        <div class="input-group">
            <input type="text" id="title" class="form-control" placeholder="タイトルを入力" aria-label="タイトルを入力">
        </div>
        <div style="height: 10px;"></div>
        <label for="text" class="form-label">投稿内容</label>
        <div class="input-group">
            <textarea id="text" class="form-control" placeholder="Markdown記法が使えます" style="height: 300px"></textarea>
        </div>
        <div style="height: 10px;"></div>
        <div class="input-group">
            <span class="input-group-text" id="input-group-left-example">UUID</span>
            <input type="text" id="uuid" class="form-control" placeholder="自動で入力されます" aria-label="自動で入力されます" aria-describedby="input-group-left" disabled>
        </div>
        <div style="height: 10px;"></div>
        <div class="input-group">
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="everyone">
                <label class="form-check-label" for="everyone">@everyoneメンション</label>
            </div>
            <button type="button" class="btn btn-outline-primary ms-auto" onclick="sendData('notify');">送信</button>
        </div>
    </div>
    `)
    $('#uuid').val(searchParams.get('uuid'));
});
$('#createNewBtn').click(() => {
    $('#formHolder').html(`
    <h1 class="modeTitle">アップデート情報を送信</h1>
    <hr>
    <div class="itemContainer  col-sm-8 col-xl-5">
        <label for="version" class="form-label">バージョン</label>
        <div class="input-group">
            <span class="input-group-text" id="input-group-left-example">v</span>
            <input type="text" id="version" class="form-control" placeholder="x.y.x" aria-label="x.y.x" aria-describedby="input-group-left">
        </div>
        <div style="height: 10px;"></div>
        <label for="date" class="form-label">日付</label>
        <div class="input-group">
            <input type="text" id="date" class="form-control" placeholder="2021/01/01" aria-label="2021/01/01" aria-describedby="input-group-button-right">
            <button type="button" class="btn btn-outline-secondary" id="input-group-button-right" onclick="dateFill();">自動入力</button>
        </div>
        <div style="height: 10px;"></div>
        <label for="text" class="form-label">投稿内容</label>
        <div class="input-group">
            <textarea id="text" class="form-control" placeholder="Markdown記法が使えます" style="height: 300px"></textarea>
        </div>
        <div style="height: 10px;"></div>
        <div class="input-group">
            <span class="input-group-text" id="input-group-left-example">UUID</span>
            <input type="text" id="uuid" class="form-control" placeholder="自動で入力されます" aria-label="自動で入力されます" aria-describedby="input-group-left" disabled>
        </div>
        <div style="height: 10px;"></div>
        <div class="input-group">
            <button type="button" class="btn btn-outline-primary ms-auto" onclick="sendData();">送信</button>
        </div>
    </div>
    `);
    $('#uuid').val(searchParams.get('uuid'));
});
$('#editBtn').click(() => {
    $('#formHolder').html(`
    <h1 class="modeTitle">投稿を編集</h1>
    <hr>
    <div class="itemContainer  col-sm-8 col-xl-5">
        <div style="height: 10px;"></div>
        <label for="msgId" class="form-label">メッセージID</label>
        <div class="input-group">
            <input type="text" id="msgId" class="form-control" placeholder="メッセージIDを入力" aria-label="チャンネルID-メッセージID" aria-describedby="input-group-button-right">
            <button type="button" class="btn btn-outline-secondary" id="input-group-button-right" onclick="getMsg();">取得</button>
        </div>
        <div style="height: 10px;"></div>
        <label for="chId" class="form-label">チャンネルID</label>
        <div class="input-group">
            <input type="text" id="chId" class="form-control" placeholder="自動で入力されます" aria-label="自動で入力されます">
        </div>
        <div style="height: 10px;"></div>
        <label for="title" class="form-label">タイトル</label>
        <div class="input-group">
            <input type="text" id="title" class="form-control" placeholder="タイトルを入力" aria-label="タイトルを入力">
        </div>
        <div style="height: 10px;"></div>
        <label for="text" class="form-label">投稿内容</label>
        <div class="input-group">
            <textarea id="text" class="form-control" placeholder="Markdown記法が使えます" style="height: 300px"></textarea>
        </div>
        <div style="height: 10px;"></div>
        <div class="input-group">
            <span class="input-group-text" id="input-group-left-example">UUID</span>
            <input type="text" id="uuid" class="form-control" placeholder="自動で入力されます" aria-label="自動で入力されます" aria-describedby="input-group-left" disabled>
        </div>
        <div style="height: 10px;"></div>
        <div class="input-group">
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="everyone">
                <label class="form-check-label" for="everyone">@everyoneメンション</label>
            </div>
            <button type="button" class="btn btn-outline-primary ms-auto" onclick="sendData('editPost');">送信</button>
        </div>
    </div>
    `);
    $('#uuid').val(searchParams.get('uuid'));
});

window.dateFill = () => {
    var d = new Date();
    $('#date').val(`${d.getFullYear()}/${('00' + (d.getMonth() + 1)).slice(-2)}/${('00' + (d.getDate())).slice(-2)}`);
}

window.getMsg = () => {
    const msgId = $('#msgId').val().split('-')[1];
    const chId = $('#msgId').val().split('-')[0];
    fetch(`${location.protocol}//${location.hostname}:10000/api/get/msg?i=${msgId}&ci=${chId}`)
    .then((res) => {
        return res.blob()
    })
    .then((res) => {
        res.text()
        .then(val => {
            const data = JSON.parse(val);
            $('#msgId').val(data.msgId);
            $('#chId').val(data.chId);
            $('#title').val(data.title);
            $('#everyone').val(data.everyone);
            $('#text').val(data.content);
        })
    });
}

window.sendData = (m = 'newPost') => {
    if (!confirm('内容に誤りがないことを確認しましたか？')) return;
    const i = $('#msgId').val();
    const v = $('#version').val();
    const d = $('#date').val();
    const txt = $('#text').val();
    const u = $('#uuid').val();
    const ttl = $('#title').val();
    const e =$('#everyone').prop('checked');
    const ci = $('#chId').val();
    const data = {
        mode: m,
        uuid: u,
        msgId: i,
        chId: ci,
        version: v,
        date: d,
        text: txt,
        title: ttl,
        everyone: e,
    };
    const param = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };
    console.log(data);
    console.log(param);
    const url = m === 'notify' ? `${location.protocol}//${location.hostname}:10000/api/post/notify` : `${location.protocol}//${location.hostname}:10000/api/post/update`
    fetch(url, param)
    .then((res) => {
        if (!res.ok) {
            alert('エラーが発生しました');
            throw new Error(`${res.status} ${res.statusText}`);
        }
        return res.blob()
    })
    .then((blob) => {
        blob.text()
        .then(val => {
            const data = JSON.parse(val);
            if (data.status !== 'OK') {
                switch (data.reason) {
                    case 'InvalidUUID':
                        alert('無効なUUIDです。再度アクセスし直してください。');
                        break;
                }
            }
            else {
                alert('正常に送信されました');
            }
        });
    });
};

// 勉強しろよこんなところ読んでないで！