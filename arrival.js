"use strict";

/*
=========================================
Earthquake Monitor v2
arrival.js
=========================================
*/

class Arrival {

    constructor() {

        // km/s
        this.P_SPEED = 6.0;
        this.S_SPEED = 3.5;

        this.timer = null;

    }

    /*==========================
        2点間距離
    ==========================*/

    distance(lat1, lon1, lat2, lon2) {

        const R = 6371;

        const toRad =
            deg => deg * Math.PI / 180;

        const dLat =
            toRad(lat2 - lat1);

        const dLon =
            toRad(lon2 - lon1);

        const a =

            Math.sin(dLat / 2) ** 2 +

            Math.cos(
                toRad(lat1)
            ) *

            Math.cos(
                toRad(lat2)
            ) *

            Math.sin(dLon / 2) ** 2;

        const c =

            2 *

            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return R * c;

    }

    /*==========================
        表示開始
    ==========================*/

    start(quake) {

        if (this.timer) {

            clearInterval(
                this.timer
            );

        }

        this.update(quake);

        this.timer =

            setInterval(() => {

                this.update(quake);

            }, 1000);

    }

    /*==========================
        更新
    ==========================*/

    update(quake) {

        const home =
            japanMap.getHome();

        const area =
            document.getElementById(
                "arrivalInfo"
            );

        if (!home) {

            area.innerHTML =

                `
<div class="arrival-box">

地図をクリックして
自宅を設定してください。

</div>
`;

            return;

        }

        const distance =

            this.distance(

                quake.latitude,
                quake.longitude,

                home.lat,
                home.lon

            );

        const pTime =
            distance / this.P_SPEED;

        const sTime =
            distance / this.S_SPEED;

        const elapsed =

            (Date.now()

                -

                new Date(
                    quake.time
                ).getTime())

            / 1000;

        const remain =

            Math.max(

                0,

                Math.ceil(
                    sTime - elapsed
                )

            );

        area.innerHTML =

            `
<div class="arrival-box">

<div class="arrival-title">

距離

</div>

<div class="arrival-time">

${distance.toFixed(0)} km

</div>

</div>

<div class="arrival-box">

<div class="arrival-title">

P波到達

</div>

<div class="arrival-time">

${pTime.toFixed(1)} 秒

</div>

</div>

<div class="arrival-box">

<div class="arrival-title">

S波到達

</div>

<div class="arrival-time">

${sTime.toFixed(1)} 秒

</div>

</div>

<div class="arrival-box">

<div class="arrival-title">

あと

</div>

<div class="arrival-time">

${remain} 秒

</div>

</div>
`;

    }

}

const arrival =
    new Arrival();
