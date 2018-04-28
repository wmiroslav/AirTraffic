"use strict";


// sort objects by some property
// example: sort airplanes by altitude
function sortBy(array, prop) {
    return array.sort(function(obj1, obj2) {
        return obj2[prop] - obj1[prop];
    });
}
 

// make HTTP GET request
function httpGetAsync(url, successCallback, errorCallback) {
    var fullUrl = config.baseUrl + url;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4) {
            if(xmlHttp.status == 200) {
                successCallback(JSON.parse(xmlHttp.responseText));
            } else {
                errorCallback(xmlHttp.status);
            }
        }
    }
    xmlHttp.open("GET", fullUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}



