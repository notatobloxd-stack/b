"use strict";

/*
======================================
Earthquake Monitor
Leaflet Map
Step 1
======================================
*/

class JapanMap {

    constructor(id) {

        this.map = L.map(id, {
            zoomControl: true
        });

        // 日本全体を表示
        this.map.setView([36.2048, 138.2529], 5);

        // OpenStreetMap
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 18,
                attribution: "© OpenStreetMap contributors"
            }
        ).addTo(this.map);

    }

    setEpicenter(quake) {

    // 前回のマーカーを削除
    if (this.epicenterMarker) {
        this.map.removeLayer(this.epicenterMarker);
    }

    this.epicenterMarker = L.marker([
        quake.latitude,
        quake.longitude
    ]).addTo(this.map);

    this.epicenterMarker.bindPopup(`
        <b>${quake.hypocenter}</b><br>
        M${quake.magnitude}<br>
        深さ ${quake.depth} km<br>
        最大震度 ${this.scaleToText(quake.maxScale)}<br>
        ${quake.time}
    `);

    // 地震の場所へ移動
    this.map.setView(
        [quake.latitude, quake.longitude],
        7,
        {
            animate: true,
            duration: 1
        }
    );

}

    scaleToText(scale){

    const table = {
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

    return table[scale] ?? "?";

}
    

}

const japanMap = new JapanMap("japanMap");
