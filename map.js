"use strict";

/*
======================================
Earthquake Monitor
Leaflet Map
======================================
*/

class JapanMap {

    constructor(id) {

        this.map = L.map(id, {
            zoomControl: true
        });

        // 日本全体
        this.map.setView([36.2048, 138.2529], 5);

        // 地図
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 18,
                attribution: "© OpenStreetMap contributors"
            }
        ).addTo(this.map);

        this.homeMarker = null;
        this.epicenterMarker = null;

        // 地図クリックで自宅設定
        this.map.on("click", (e) => {

            this.setHome(
                e.latlng.lat,
                e.latlng.lng
            );

        });

        // 保存済み自宅を読み込む
        const saved =
            localStorage.getItem("homeLocation");

        if (saved) {

            const home =
                JSON.parse(saved);

            this.setHome(
                home.lat,
                home.lon
            );

        }

    }

    /* ---------------------------
       自宅設定
    --------------------------- */

    setHome(lat, lon) {

        if (this.homeMarker) {

            this.map.removeLayer(
                this.homeMarker
            );

        }

        this.homeMarker = L.marker(
            [lat, lon]
        ).addTo(this.map);

        this.homeMarker.bindPopup(
            "🏠 自宅"
        );

        localStorage.setItem(
            "homeLocation",
            JSON.stringify({
                lat,
                lon
            })
        );

        const latInput =
            document.getElementById("homeLat");

        const lonInput =
            document.getElementById("homeLon");

        if (latInput) {

            latInput.value =
                lat.toFixed(6);

        }

        if (lonInput) {

            lonInput.value =
                lon.toFixed(6);

        }

    }

    /* ---------------------------
       震源表示
    --------------------------- */

    setEpicenter(quake) {

        if (
            quake.latitude == null ||
            quake.longitude == null
        ) {

            console.warn(
                "緯度経度がありません",
                quake
            );

            return;

        }

        if (this.epicenterMarker) {

            this.map.removeLayer(
                this.epicenterMarker
            );

        }

        this.epicenterMarker =
            L.marker([
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

        this.map.flyTo(
            [
                quake.latitude,
                quake.longitude
            ],
            7,
            {
                duration: 1.5
            }
        );

    }

    /* ---------------------------
       震度表示
    --------------------------- */

    scaleToText(scale) {

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

        return table[scale] ?? "?";

    }

}

const japanMap =
    new JapanMap("japanMap");
