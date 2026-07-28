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

}

const japanMap = new JapanMap("japanMap");
