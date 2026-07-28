"use strict";

/*
======================================
Earthquake Monitor
app.js
Step 1
======================================
*/

const earthquakeList = document.getElementById("earthquakeList");
const lastUpdate = document.getElementById("lastUpdate");
// 例: 兵庫県姫路市（あとで設定画面で変更できる）
const homeLatInput =
    document.getElementById("homeLat");


const homeLonInput =
    document.getElementById("homeLon");

const saveHomeButton =
    document.getElementById("saveHome");

const HOME = {
    lat: 34.8151,
    lon: 134.6853
};

const arrivalInfo =
    document.getElementById("arrivalInfo");

/* -----------------------------
   設定
----------------------------- */

const CONFIG = {
    // 更新間隔（60秒）
    UPDATE_INTERVAL: 60000,

    // 最大表示件数
    MAX_ITEMS: 20,

    // タイムアウト
    FETCH_TIMEOUT: 10000
};

/* -----------------------------
   状態
----------------------------- */

let earthquakes = [];
let loading = false;

/* -----------------------------
   初期化
----------------------------- */

async function init() {

    const savedHome =
    localStorage.getItem(
        "homeLocation"
    );

if(savedHome){

    const home=
        JSON.parse(savedHome);

    homeLatInput.value=home.lat;

    homeLonInput.value=home.lon;

}
    
    await loadEarthquakes();

    setInterval(() => {
        loadEarthquakes();
    }, CONFIG.UPDATE_INTERVAL);

}

window.addEventListener("load", init);

saveHomeButton.addEventListener(
    "click",
    saveHome
);

/* -----------------------------
   地震情報取得
----------------------------- */

async function loadEarthquakes() {

    if (loading) return;

    loading = true;

    showLoading();

    try {

        /*
         Step2で実際のAPI取得を書く
        */
      
      // 地震情報取得
const response = await fetch(
    "https://api.p2pquake.net/v2/history?codes=551&limit=" + CONFIG.MAX_ITEMS,
    {
        signal: AbortSignal.timeout(CONFIG.FETCH_TIMEOUT)
    }
);

if (!response.ok) {
    throw new Error("地震情報を取得できませんでした");
}

const data = await response.json();

       console.log(data[0]);
       
earthquakes = data.map(item => {

    const quake = item.earthquake;
    const hypo = quake.hypocenter ?? {};

    return {

        id: item.id,

        time: quake.time,

        hypocenter: hypo.name ?? "不明",

        latitude: hypo.latitude,

        longitude: hypo.longitude,

        magnitude: hypo.magnitude ?? "-",

        depth: hypo.depth ?? "-",

        maxScale: quake.maxScale,

        tsunami: item.domesticTsunami ?? "Unknown"

    };

});

       // 最新地震の到達予測
if (earthquakes.length > 0) {

    const latest = earthquakes[0];

    const result = Arrival.calculate(
        {
            lat: latest.latitude,
            lon: latest.longitude
        },
        HOME,
        latest.time
    );

    showArrival(result, latest);

}

        const savedHome = localStorage.getItem("homeLocation");

if (savedHome && earthquakes.length > 0) {

    const home = JSON.parse(savedHome);

    const latest = earthquakes[0];

    if (
        latest.latitude != null &&
        latest.longitude != null
    ) {

        const result = Arrival.calculate(
            {
                lat: latest.latitude,
                lon: latest.longitude
            },
            home,
            latest.time
        );

        arrivalInfo.innerHTML = `
            <strong>📍震源</strong><br>
            ${latest.hypocenter}<br><br>

            <strong>📏距離</strong><br>
            ${result.distance} km<br><br>

            <strong>🌊P波</strong><br>
            約 ${result.pTime} 秒<br><br>

            <strong>🌊S波</strong><br>
            約 ${result.sTime} 秒<br><br>

            <strong>⏳あと</strong><br>
            ${result.remaining} 秒
        `;

    }

}

        if (earthquakes.length > 0) {

    const latest = earthquakes[0];

    japanMap.setEpicenter(
        latest.latitude,
        latest.longitude,
        latest.time
    );

}
        
       renderEarthquakes();

        lastUpdate.textContent =
            new Date().toLocaleString("ja-JP");

    }

    catch (error) {

        console.error(error);

        showError(error.message);

    }

    finally {

        loading = false;

    }

}

/* -----------------------------
   表示
----------------------------- */

/* -----------------------------
   表示
----------------------------- */

function renderEarthquakes() {

    earthquakeList.innerHTML = "";

    if (earthquakes.length === 0) {

        earthquakeList.innerHTML = `
            <div class="loading">
                現在表示できる地震情報がありません
            </div>
        `;

        return;
    }

    earthquakes.forEach(quake => {

        const card = document.createElement("div");

        card.className = `earthquake-card ${getScaleClass(quake.maxScale)}`;

        card.innerHTML = `
            <h3>📍 ${quake.hypocenter}</h3>

            <div class="info">

                <div>
                    <strong>最大震度</strong><br>
                    ${scaleToText(quake.maxScale)}
                </div>

                <div>
                    <strong>マグニチュード</strong><br>
                    M${quake.magnitude}
                </div>

                <div>
                    <strong>深さ</strong><br>
                    ${formatDepth(quake.depth)}
                </div>

                <div>
                    <strong>津波</strong><br>
                    ${tsunamiToText(quake.tsunami)}
                </div>

                <div>
                    <strong>発生時刻</strong><br>
                    ${formatTime(quake.time)}
                </div>

            </div>
        `;

        earthquakeList.appendChild(card);

    });

}

/* -----------------------------
   読み込み表示
----------------------------- */

function showLoading() {

    earthquakeList.innerHTML =
    `
    <div class="loading">
        地震情報を取得しています...
    </div>
    `;

}

/* -----------------------------
   エラー表示
----------------------------- */

function showError(message) {

    earthquakeList.innerHTML =
    `
    <div class="loading">
        ❌ ${message}
    </div>
    `;

}

/* -----------------------------
   CSSクラス取得
----------------------------- */

function getScaleClass(scale) {

    switch (scale) {

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

/* -----------------------------
   深さ表示
----------------------------- */

function formatDepth(depth) {

    if (depth === null || depth === undefined)
        return "不明";

    if (depth <= 0)
        return "ごく浅い";

    return `${depth} km`;

}

/* -----------------------------
   時刻表示
----------------------------- */

function formatTime(time) {

    if (!time)
        return "不明";

    const date = new Date(time);

    return date.toLocaleString("ja-JP");

}

/* -----------------------------
   震度変換
----------------------------- */

function scaleToText(scale) {

    const table = {
        10: "1",
        20: "2",
        30: "3",
        40: "4",
        45: "5弱",
        50: "5強",
        55: "6弱",
        60: "6強",
        70: "7"
    };

    return table[scale] ?? "不明";

}

/* -----------------------------
   津波変換
----------------------------- */

function tsunamiToText(type) {

    switch (type) {

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


function showArrival(result, quake) {

    const el = document.getElementById("arrivalInfo");

    el.innerHTML = `
        <div class="arrival-big">
            <div>📍 ${quake.hypocenter}</div>
            <div class="time">
                ${result.remaining} 秒
            </div>
            <div>S波到達まで（推定）</div>
        </div>

        <div class="arrival-row">
            <span>距離</span>
            <strong>${result.distance} km</strong>
        </div>

        <div class="arrival-row">
            <span>P波</span>
            <strong>約 ${result.pTime} 秒</strong>
        </div>

        <div class="arrival-row">
            <span>S波</span>
            <strong>約 ${result.sTime} 秒</strong>
        </div>
    `;

}

function saveHome(){

    const home={

        lat:Number(homeLatInput.value),

        lon:Number(homeLonInput.value)

    };

    localStorage.setItem(
        "homeLocation",
        JSON.stringify(home)
    );

    alert("保存しました！");

}
