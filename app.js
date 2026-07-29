"use strict";

/*
=========================================
Earthquake Monitor v2
app.js
Part 1
=========================================
*/

/*==========================
設定
==========================*/

const CONFIG = {

    HISTORY_LIMIT: 20,

    API:
    "https://api.p2pquake.net/v2/history?codes=551&limit=20"

};

/*==========================
HTML
==========================*/

const earthquakeList =
    document.getElementById(
        "earthquakeList"
    );

const lastUpdate =
    document.getElementById(
        "lastUpdate"
    );

const saveHomeButton =
    document.getElementById(
        "saveHome"
    );

const homeLatInput =
    document.getElementById(
        "homeLat"
    );

const homeLonInput =
    document.getElementById(
        "homeLon"
    );

/*==========================
状態
==========================*/

let earthquakes = [];

let latestID = null;

/*==========================
初期化
==========================*/

window.addEventListener(

    "load",

    init

);

async function init(){

    loadSavedHome();

    registerButtons();

    await loadHistory();

    startRealtime();

}

/*==========================
保存済み自宅
==========================*/

function loadSavedHome(){

    const saved =

        localStorage.getItem(
            "homeLocation"
        );

    if(!saved)
        return;

    const home =
        JSON.parse(saved);

    homeLatInput.value =
        home.lat;

    homeLonInput.value =
        home.lon;

}

/*==========================
ボタン
==========================*/

function registerButtons(){

    saveHomeButton.addEventListener(

        "click",

        ()=>{

            const lat =
                parseFloat(
                    homeLatInput.value
                );

            const lon =
                parseFloat(
                    homeLonInput.value
                );

            if(
                isNaN(lat) ||
                isNaN(lon)
            ){

                alert(
                    "緯度・経度を入力してください"
                );

                return;

            }

            japanMap.setHome(
                lat,
                lon
            );

        }

    );

}

/*==========================
履歴取得
==========================*/

async function loadHistory(){

    try{

        const response =
            await fetch(
                CONFIG.API
            );

        const data =
            await response.json();

        earthquakes =
            data.map(convertData);

        if(
            earthquakes.length
        ){

            latestID =
                earthquakes[0].id;

            updateLatest(
                earthquakes[0]
            );

        }

        renderList();

        updateTime();

    }

    catch(error){

        console.error(error);

    }

}

/*==========================
リアルタイム
==========================*/

function startRealtime(){

    realtime.onEarthquake(

        quake=>{

            if(
                quake.id===latestID
            ) return;

            latestID =
                quake.id;

            earthquakes.unshift(
                quake
            );

            earthquakes =
                earthquakes.slice(
                    0,
                    CONFIG.HISTORY_LIMIT
                );

            updateLatest(
                quake
            );

            renderList();

            updateTime();

        }

    );

    realtime.connect();

}

/*==========================
最新地震更新
==========================*/

function updateLatest(quake){

    japanMap.setEpicenter(
        quake
    );

    arrival.start(
        quake
    );

}

/*
=========================================
app.js
Part 2
一覧表示
=========================================
*/

/*==========================
一覧表示
==========================*/

function renderList() {

    earthquakeList.innerHTML = "";

    if (earthquakes.length === 0) {

        earthquakeList.innerHTML =
        `
        <div class="loading">
            地震情報がありません
        </div>
        `;

        return;

    }

    earthquakes.forEach(quake => {

        const card =
            document.createElement("div");

        card.className =
            "earthquake-card " +
            getScaleClass(quake.maxScale);

        card.innerHTML =

        `
        <h3>📍 ${quake.hypocenter}</h3>

        <div class="info">

            <div>

                <strong>最大震度</strong><br>

                ${scaleToText(
                    quake.maxScale
                )}

            </div>

            <div>

                <strong>マグニチュード</strong><br>

                M${quake.magnitude}

            </div>

            <div>

                <strong>深さ</strong><br>

                ${formatDepth(
                    quake.depth
                )}

            </div>

            <div>

                <strong>津波</strong><br>

                ${tsunamiToText(
                    quake.tsunami
                )}

            </div>

            <div>

                <strong>発生時刻</strong><br>

                ${formatTime(
                    quake.time
                )}

            </div>

        </div>
        `;

        earthquakeList.appendChild(
            card
        );

    });

}

/*==========================
データ変換
==========================*/

function convertData(item){

    const q =
        item.earthquake;

    return{

        id:item.id,

        time:q.time,

        hypocenter:
            q.hypocenter?.name ??
            "不明",

        latitude:
            q.hypocenter?.latitude,

        longitude:
            q.hypocenter?.longitude,

        magnitude:
            q.hypocenter?.magnitude ??
            "-",

        depth:
            q.hypocenter?.depth ??
            "-",

        maxScale:
            q.maxScale,

        tsunami:
            q.domesticTsunami

    };

}

/*==========================
最終更新
==========================*/

function updateTime(){

    lastUpdate.textContent =

        new Date()

        .toLocaleString(

            "ja-JP"

        );

}

/*==========================
深さ
==========================*/

function formatDepth(depth){

    if(
        depth===null ||
        depth===undefined
    ){

        return "不明";

    }

    if(depth<=0){

        return "ごく浅い";

    }

    return depth+" km";

}

/*==========================
時間
==========================*/

function formatTime(time){

    if(!time)
        return "不明";

    return new Date(time)

    .toLocaleString("ja-JP");

}

/*==========================
津波
==========================*/

function tsunamiToText(type){

    switch(type){

        case "None":
            return "なし";

        case "Checking":
            return "調査中";

        case "NonEffective":
            return "若干の海面変動";

        case "Watch":
            return "津波注意報";

        case "Warning":
            return "津波警報";

        default:
            return "不明";

    }

}

/*==========================
震度
==========================*/

function scaleToText(scale){

    const table={

        10:"1",

        20:"2",

        30:"3",

        40:"4",

        45:"5弱",

        50:"5強",

        55:"6弱",

        60:"6強",

        70:"7"

    };

    return table[scale] ?? "不明";

}

/*==========================
震度カラー
==========================*/

function getScaleClass(scale){

    switch(scale){

        case 10:
            return "shindo-1";

        case 20:
            return "shindo-2";

        case 30:
            return "shindo-3";

        case 40:
            return "shindo-4";

        case 45:
        case 50:
            return "shindo-5";

        case 55:
        case 60:
            return "shindo-6";

        case 70:
            return "shindo-7";

        default:
            return "";

    }

}

/*
=========================================
app.js
Part3
通知・効果音・リアルタイム
=========================================
*/

/*==========================
通知
==========================*/

function showNotification(quake){

    const old =
        document.getElementById(
            "notification"
        );

    if(old){

        old.remove();

    }

    const notification =
        document.createElement("div");

    notification.id =
        "notification";

    notification.innerHTML=

`
<div id="notificationTitle">

🚨 地震情報

</div>

<div id="notificationBody">

<strong>${quake.hypocenter}</strong><br><br>

最大震度：
${scaleToText(quake.maxScale)}

<br>

M${quake.magnitude}

<br>

深さ：
${formatDepth(quake.depth)}

</div>
`;

    document.body.appendChild(
        notification
    );

    playNotificationSound();

    setTimeout(()=>{

        notification.remove();

    },10000);

}

/*==========================
通知音
==========================*/

function playNotificationSound(){

    const audio = new Audio(

"https://actions.google.com/sounds/v1/alarms/beep_short.ogg"

    );

    audio.volume=1;

    audio.play().catch(()=>{});

}

/*==========================
最新地震更新
==========================*/

function updateLatest(quake){

    japanMap.setEpicenter(
        quake
    );

    arrival.start(
        quake
    );

    showNotification(
        quake
    );

}

/*==========================
クリックで地震へ移動
==========================*/

document.addEventListener(

    "click",

    e=>{

        const card =
            e.target.closest(
                ".earthquake-card"
            );

        if(!card)
            return;

        const index =

            [...document.querySelectorAll(
                ".earthquake-card"
            )]

            .indexOf(card);

        const quake =
            earthquakes[index];

        if(!quake)
            return;

        japanMap.setEpicenter(
            quake
        );

        arrival.start(
            quake
        );

    }

);

/*==========================
デバッグ
==========================*/

console.log(

"Earthquake Monitor v2 Ready"

);
