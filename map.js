"use strict";

class JapanMap {

    constructor(id){

        this.map = L.map(id, {

            zoomControl:true,

            attributionControl:true

        });

        this.map.setView(
            [36.2,138.2],
            5
        );

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom:18,
                attribution:"© OpenStreetMap contributors"
            }
        ).addTo(this.map);

    }

}

const japanMap =
    new JapanMap("japanMap");
