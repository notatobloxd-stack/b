"use strict";

/*
======================================
Earthquake Monitor
map.js
Step 1
======================================
*/

class JapanMap {

    constructor(canvasId) {

        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.mapData = null;

        this.loadJapanMap();
        this.resize();

        this.waveDistanceKm = 0;
        this.waveSpeed = 3.5;
        this.startTime = null;

        this.epicenter = null;
        this.quakeTime = null;

        this.wave = {
            pRadius: 0,
            sRadius: 0
        };
        
        window.addEventListener("resize", () => this.resize());

        // 地図設定
        this.padding = 40;

        // 震源
        this.epicenter = null;

        // 自宅
        this.home = null;

        // 揺れ
        this.waveRadius = 0;

        this.animationFrame = null;

        this.draw();

    }

    resize() {

        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.draw();

    }

    setEpicenter(lat, lon) {

        this.epicenter = {
            lat,
            lon
        };

        this.draw();

    }

    setHome(lat, lon) {

        this.home = {
            lat,
            lon
        };

        this.draw();

    }

    startWave() {

    this.startTime = performance.now();

    if (this.animationFrame) {

        cancelAnimationFrame(this.animationFrame);

    }

    this.animateWave();

}

    animateWave() {

    const now = new Date();

    const elapsed =
        (now - this.quakeTime) / 1000;

    this.wave.pRadius = elapsed * 6;
    this.wave.sRadius = elapsed * 3.5;

    this.draw();

    this.animationFrame =
        requestAnimationFrame(
            () => this.animateWave()
        );

}

    kmToPixel(km) {

    /*
      日本全体

      横 約2200km
    */

    const mapWidthKm = 2200;

    const drawWidth =
        this.canvas.width -
        this.padding * 2;

    return km / mapWidthKm * drawWidth;

}
    
    draw() {

        const ctx = this.ctx;

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        this.drawBackground();

        this.drawJapan();

        this.drawPWave();

        this.drawSWave();

        this.drawEpicenter();

        this.drawHome();

    }

    drawBackground() {

        const ctx = this.ctx;

        ctx.fillStyle = "#0f172a";

        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

    }

    async loadJapanMap() {

    try {

        const response = await fetch("japan.geojson");

        this.mapData = await response.json();

        this.draw();

    }

    catch (error) {

        console.error("地図データの読み込み失敗", error);

    }

}

drawJapan() {

    if (!this.mapData) return;

    const ctx = this.ctx;

    ctx.strokeStyle = "#4b5563";
    ctx.fillStyle = "#1e293b";
    ctx.lineWidth = 1;

    this.mapData.features.forEach(feature => {

        const geometry = feature.geometry;

        if (geometry.type === "Polygon") {

            this.drawPolygon(geometry.coordinates);

        }

        if (geometry.type === "MultiPolygon") {

            geometry.coordinates.forEach(poly => {

                this.drawPolygon(poly);

            });

        }

    });

}

    drawEpicenter() {

        if (!this.epicenter) return;

        const pos = this.latLonToCanvas(
            this.epicenter.lat,
            this.epicenter.lon
        );

        const ctx = this.ctx;

        ctx.fillStyle = "#ff3333";

        ctx.beginPath();

        ctx.arc(
            pos.x,
            pos.y,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    drawHome() {

        if (!this.home) return;

        const pos = this.latLonToCanvas(
            this.home.lat,
            this.home.lon
        );

        const ctx = this.ctx;

        ctx.fillStyle = "#00bcd4";

        ctx.beginPath();

        ctx.arc(
            pos.x,
            pos.y,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    drawPWave() {

}

drawSWave() {

}

drawEpicenter() {

}

drawHome() {

}
    
    drawWave() {

    if (!this.epicenter) return;

    const ctx = this.ctx;

    const center =
        this.latLonToCanvas(
            this.epicenter.lat,
            this.epicenter.lon
        );

    const radius =
        this.kmToPixel(
            this.waveDistanceKm
        );

    ctx.beginPath();

    ctx.arc(
        center.x,
        center.y,
        radius,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle = "#ffd54f";

    ctx.lineWidth = 3;

    ctx.stroke();

}

    latLonToCanvas(lat, lon) {

        const width =
            this.canvas.width - this.padding * 2;

        const height =
            this.canvas.height - this.padding * 2;

        // 日本のおおよその範囲
        const minLat = 24;
        const maxLat = 46;

        const minLon = 123;
        const maxLon = 146;

        const x =
            ((lon - minLon) /
            (maxLon - minLon))
            * width
            + this.padding;

        const y =
            height -
            ((lat - minLat) /
            (maxLat - minLat))
            * height
            + this.padding;

        return {
            x,
            y
        };

    }

}

const japanMap =
    new JapanMap("japanMap");

drawPolygon(polygons) {

    const ctx = this.ctx;

    polygons.forEach(ring => {

        ctx.beginPath();

        ring.forEach((coord, index) => {

            const p = this.latLonToCanvas(
                coord[1],
                coord[0]
            );

            if (index === 0) {

                ctx.moveTo(p.x, p.y);

            } else {

                ctx.lineTo(p.x, p.y);

            }

        });

        ctx.closePath();

        ctx.fill();
        ctx.stroke();

    });

}
