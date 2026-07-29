"use strict";

/*
=========================================
Earthquake Monitor v2
Leaflet Map
=========================================
*/

class JapanMap {

    constructor(id) {

        // 地図作成
        this.map = L.map(id, {
            zoomControl: true
        });

        // 日本全体
        this.map.setView(
            [36.3, 138.3],
            5
        );

        // OpenStreetMap
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    "&copy; OpenStreetMap contributors",
                maxZoom: 18
            }
        ).addTo(this.map);

        // マーカー
        this.homeMarker = null;
        this.epicenterMarker = null;

        // 波
        this.pWave = null;
        this.sWave = null;

        // アニメーション
        this.animation = null;

        // 地図クリック
        this.map.on(
            "click",
            e => {

                this.setHome(
                    e.latlng.lat,
                    e.latlng.lng
                );

            }
        );

        // 保存済み自宅
        this.loadHome();

    }

    /*==========================
        自宅
    ==========================*/

    setHome(lat, lon) {

        if (this.homeMarker) {

            this.map.removeLayer(
                this.homeMarker
            );

        }

        this.homeMarker =
            L.marker(
                [lat, lon]
            ).addTo(this.map);

        this.homeMarker
            .bindPopup("🏠 自宅");

        localStorage.setItem(
            "homeLocation",
            JSON.stringify({
                lat,
                lon
            })
        );

        const latInput =
            document.getElementById(
                "homeLat"
            );

        const lonInput =
            document.getElementById(
                "homeLon"
            );

        if (latInput)
            latInput.value =
                lat.toFixed(6);

        if (lonInput)
            lonInput.value =
                lon.toFixed(6);

    }

    loadHome() {

        const saved =
            localStorage.getItem(
                "homeLocation"
            );

        if (!saved)
            return;

        const home =
            JSON.parse(saved);

        this.setHome(
            home.lat,
            home.lon
        );

    }

    getHome() {

        if (!this.homeMarker)
            return null;

        const p =
            this.homeMarker.getLatLng();

        return {

            lat: p.lat,
            lon: p.lng

        };

    }

    /*==========================
        震源
    ==========================*/

    setEpicenter(quake) {

        if (this.epicenterMarker) {

            this.map.removeLayer(
                this.epicenterMarker
            );

        }

        this.epicenterMarker =
            L.circleMarker(
                [
                    quake.latitude,
                    quake.longitude
                ],
                {
                    radius: 8,
                    color: "#fff",
                    weight: 2,
                    fillColor: "#ff3333",
                    fillOpacity: 1
                }
            ).addTo(this.map);

        this.epicenterMarker
            .bindPopup(
                `
<b>${quake.hypocenter}</b><br>
最大震度 ${this.scale(quake.maxScale)}<br>
M${quake.magnitude}<br>
深さ ${quake.depth}km
`
            );

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

        this.startWave(
            quake.latitude,
            quake.longitude
        );

    }

    /*==========================
        P波 S波
    ==========================*/

    startWave(lat, lon) {

        if (this.animation) {

            clearInterval(
                this.animation
            );

        }

        if (this.pWave)
            this.map.removeLayer(
                this.pWave
            );

        if (this.sWave)
            this.map.removeLayer(
                this.sWave
            );

        this.pWave =
            L.circle(
                [lat, lon],
                {
                    radius: 0,
                    color: "#4fc3f7",
                    weight: 2,
                    fill: false
                }
            ).addTo(this.map);

        this.sWave =
            L.circle(
                [lat, lon],
                {
                    radius: 0,
                    color: "#ff9800",
                    weight: 3,
                    fill: false
                }
            ).addTo(this.map);

        let p = 0;
        let s = 0;

        this.animation =
            setInterval(() => {

                p += 600;
                s += 350;

                this.pWave.setRadius(p);
                this.sWave.setRadius(s);

                if (s > 250000) {

                    clearInterval(
                        this.animation
                    );

                }

            }, 100);

    }

    /*==========================
        震度
    ==========================*/

    scale(scale) {

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
    new JapanMap(
        "japanMap"
    );
