"use strict";

var config = {
    enableGeolocationQuestion: [
        "It is necessary to allow your geolocation to use the app.",
        "Please, allow us to use your geolocation.",
        "To use this app, please enable the geolocation."
    ],
    geolocationNotSupported: "Geolocation is not supported by this browser.",
    noAirplanes: "No airplanes in your area",
    noData: "No data",
    range: 200,
    dataRefreshTime: 1000 * 60, // 1 min
    baseUrl: "https://public-api.adsbexchange.com/VirtualRadar/",
    checkNetworkOrCORS: "Check your internet connection, and enable CORS in your browser.",
    errorOccurred: "An error occurred. Please try searching again.",
    logo: { // exections for logo paths
        "Jet Aviation Flight Services (Malta) Ltd": "jetaviation.com",
        "Jet Time": "jettimes.com",
        "Atlas Air Service AG": "atlasair.com",
        "Travel Service Airlines": "travelserveexports.com",
        "Norwegian Air International": "norwegian.com",
        "Turkmenistan Airlines": "oilgasturkmenistan.com",
        "Royal Jordanian Airlines": "rj.com",
        "Aegean Airlines": "aegeanair.com"
    }
}


