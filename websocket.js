"use strict";

/*
======================================
Earthquake Monitor
websocket.js
======================================
*/

class EarthquakeRealtime {

    constructor() {

        this.ws = null;

        this.listeners = [];

    }

    connect() {

        this.ws = new WebSocket(
            "wss://api.p2pquake.net/v2/ws"
        );

        this.ws.onopen = () => {

            console.log("✅ WebSocket接続");

        };

        this.ws.onclose = () => {

            console.log("❌ 切断");

            //5秒後に再接続
            setTimeout(
                () => this.connect(),
                5000
            );

        };

        this.ws.onerror = err => {

            console.error(err);

        };

        this.ws.onmessage = e => {

            const data = JSON.parse(e.data);

            this.handleMessage(data);

        };

    }

    onEarthquake(callback){

        this.listeners.push(callback);

    }

    handleMessage(data){

        if(data.code !== 551) return;

        this.listeners.forEach(listener=>{

            listener(data);

        });

    }

}
