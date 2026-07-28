"use strict";

/*
======================================
Earthquake Monitor
arrival.js
======================================
*/

const Arrival = {

    // P波速度 (km/s)
    P_WAVE_SPEED: 6.0,

    // S波速度 (km/s)
    S_WAVE_SPEED: 3.5,

    /* -----------------------------
       2点間の距離を計算
       (ハーバーサイン公式)
    ----------------------------- */

    distance(lat1, lon1, lat2, lon2) {

        const R = 6371; // 地球半径(km)

        const toRad = deg => deg * Math.PI / 180;

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

        return R * c;

    },

    /* -----------------------------
       到達時間を計算
    ----------------------------- */

    calculate(epicenter, home, quakeTime) {

        const distance = this.distance(
            epicenter.lat,
            epicenter.lon,
            home.lat,
            home.lon
        );

        const pTime = distance / this.P_WAVE_SPEED;
        const sTime = distance / this.S_WAVE_SPEED;

        const quakeDate = new Date(quakeTime);
        const now = new Date();

        const elapsed =
            (now - quakeDate) / 1000;

        const remaining =
            Math.max(
                0,
                Math.ceil(sTime - elapsed)
            );

        return {
            distance: Math.round(distance),
            pTime: Math.round(pTime),
            sTime: Math.round(sTime),
            remaining
        };

    }

};
