"use strict";

/*
=========================================
Earthquake Monitor v2
websocket.js
=========================================
*/

class EarthquakeRealtime {

    constructor() {

        this.ws = null;

        this.callback = null;

        this.reconnectTime = 5000;

        this.url =
            "wss://api.p2pquake.net/v2/ws";

    }

    /*==========================
        接続
    ==========================*/

    connect() {

        console.log("WebSocket接続中...");

        this.ws = new WebSocket(
            this.url
        );

        this.ws.onopen = () => {

            console.log(
                "✅ WebSocket接続"
            );

            this.setStatus(
                "🟢 接続中",
                "#22c55e"
            );

        };

        this.ws.onmessage = e => {

            try {

                const data =
                    JSON.parse(
                        e.data
                    );

                // 地震詳細情報
                if (data.code !== 551)
                    return;

                if (!this.callback)
                    return;

                const q =
                    data.earthquake;

                this.callback({

                    id:data.id,

                    time:q.time,

                    hypocenter:
                        q.hypocenter?.name ??
                        "不明",

                    latitude:
                        q.hypocenter?.latitude,

                    longitude:
                        q.hypocenter?.longitude,

                    magnitude:
                        q.hypocenter?.magnitude,

                    depth:
                        q.hypocenter?.depth,

                    maxScale:
                        q.maxScale,

                    tsunami:
                        q.domesticTsunami

                });

            }

            catch(error){

                console.error(
                    error
                );

            }

        };

        this.ws.onclose = () => {

            console.log(
                "WebSocket切断"
            );

            this.setStatus(
                "🔴 切断",
                "#ef4444"
            );

            setTimeout(()=>{

                this.connect();

            },this.reconnectTime);

        };

        this.ws.onerror = ()=>{

            console.log(
                "WebSocket Error"
            );

        };

    }

    /*==========================
        コールバック
    ==========================*/

    onEarthquake(callback){

        this.callback =
            callback;

    }

    /*==========================
        接続状態表示
    ==========================*/

    setStatus(text,color){

        const status =

            document.getElementById(
                "connectionStatus"
            );

        if(!status)
            return;

        status.textContent =
            text;

        status.style.color =
            color;

    }

}

const realtime =
    new EarthquakeRealtime();
