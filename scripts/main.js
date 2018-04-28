"use strict";



(function() {


    var airplanes;
    var userPosition;
    var geolocationAllowBtn = document.getElementById('allowLocation');
    var geolocationDeniedBtn = document.getElementById('deniedLocation');
    var warningGeolocation = document.getElementById('warning');
    var list = document.getElementById('list');
    var loadingSpinner = document.getElementById('loading-spinner');
    var singleAirplane = document.getElementById('selected-airplane');
    // for selected airplane
    var closeBtn = document.getElementById('close-airplane');
    var manufacture = document.getElementById('manufacture');
    var model = document.getElementById('model');
    var destination = document.getElementById('destination');
    var origin = document.getElementById('origin');
    var logo = document.getElementById('logo');




    // when user allow to get location
    geolocationAllowBtn.addEventListener("click", getUserLocation);



    // when user denied or block geolocation, show warning message:
    function locationDenied() {
        // we have a few random question, so we get some question...
        var numberOfQuestions = config.enableGeolocationQuestion.length;
        var i = Math.floor((Math.random() * numberOfQuestions));
        // ...and show this question to user
        warningGeolocation.innerHTML = config.enableGeolocationQuestion[i];
    }
    // when user denied to get location
    geolocationDeniedBtn.addEventListener("click", locationDenied);





    // callback function when we receive user latitute & longitude
    function onSuccessGetLocation(response) {
        // set response (latitude and longitude) to global variable
        userPosition = response;
        //remove event listener
        geolocationAllowBtn.removeEventListener("click", getUserLocation);
        geolocationDeniedBtn.removeEventListener("click", locationDenied);

        // remove element from DOM
        // we successfully get user location, so we not't need question anymore
        var wrapper = document.getElementById('questionWrapper');
        wrapper.remove();
        // and set visible airplanes list
        var airplanesContainer = document.getElementById('airplanes-container');
        airplanesContainer.classList.remove("hidden");
        
        // get data, and set interval to get data every X seconds...
        getData();
        setInterval(getData, config.dataRefreshTime);
    }

    // make HTTP erquest to get airplanes
    function getData() {
        setSpinner(true);
        var url = "AircraftList.json?lat=" + userPosition.coords.latitude + "&lng=" + userPosition.coords.longitude + "&fDstL=0&fDstU=" + config.range;
        httpGetAsync(url, onSuccessGetData, onErrorGetData)
    }


    // set spinner on UI: indicator for loading data...
    function setSpinner(show) {
        var display = show ? "block" : "none";
        loadingSpinner.setAttribute("style", "display:" + display);
    }


    // calculate icon orientation - icon class
    function getIconOrientation(angle) {
        var iconClass;
        if (angle > 0 && angle < 180) {
            iconClass = 'west';
        } else {
            iconClass = 'east';
        }
        return iconClass;
    }


    // sort objects by some property
    // example: sort airplanes by altitude
    function sortBy(array, prop) {
        return array.sort(function(obj1, obj2) {
            return obj2[prop] - obj1[prop];
        });
    }

    closeBtn.addEventListener('click', function() {
        singleAirplane.setAttribute("style", "display: hidden;");
    })

    function showAirplaneData(e) {
        // get airplane ID from DOM
        var id = e.target.dataset.id || e.target.parentElement.dataset.id;
        // find selected airplane
        var selectedAirplane;
        for (var i = 0, length = airplanes.length; i < length; i++) {
            if (airplanes[i].Id == id) {
                selectedAirplane = airplanes[i];
                break;
            }
        }
        // SHOW selecterd airplane
        if (selectedAirplane) {
            singleAirplane.setAttribute("style", "display: block;");
            console.log(selectedAirplane);
            manufacture.innerHTML = selectedAirplane.Man;
            model.innerHTML = selectedAirplane.Mdl;
            origin.innerHTML = selectedAirplane.From || config.noData;
            destination.innerHTML = selectedAirplane.To || config.noData;

            var genericUrl = selectedAirplane.Op.replace(/\s/g, '') + ".com";
            var logoUrl = "https://logo.clearbit.com/" + (config.logo[selectedAirplane.Op] || genericUrl);
            logo.src = logoUrl;

        }
        
    }

    list.addEventListener('click', showAirplaneData, false);


    // on successfully retrieve all airplanes
    function onSuccessGetData(response) {
        // first remove old data:
        while (list.firstChild) {
            list.firstChild.remove();
        }

        // if there's results, add them to the DOM
        airplanes = sortBy(response.acList, "Alt");
        var numberOfNewAirplanes = airplanes.length;
        if (numberOfNewAirplanes > 0) {
            for (var i = 0; i < numberOfNewAirplanes; i++) {
                // create wrapper/row for airplane
                var wrapperLi = document.createElement("li");
                
                // create heading wrapper 
                var wrapperH = document.createElement("h4");
                wrapperH.setAttribute("data-id", airplanes[i].Id);


                // add element for icon orientation
                var iconEl = document.createElement("span");
                iconEl.classList.add("icon-orientation");
                iconEl.classList.add(getIconOrientation(airplanes[i].Brng));
                iconEl.innerHTML = airplanes[i].Id;

                // add element for altitude
                var altitudeEl = document.createElement("span");
                altitudeEl.innerHTML = airplanes[i].Alt || config.noData;
                altitudeEl.classList.add("altitude");

                // add element for code number
                var codeNumberEl = document.createElement("span");
                codeNumberEl.innerHTML = airplanes[i].CNum || config.noData;
                codeNumberEl.classList.add("code-number");

                // add new elements to DOM
                wrapperH.appendChild(iconEl);
                wrapperH.appendChild(altitudeEl);
                wrapperH.appendChild(codeNumberEl);
                wrapperLi.appendChild(wrapperH);
                list.appendChild(wrapperLi);
            }
        } else {
            // create wrapper/row for airplane
            var wrapperLi = document.createElement("li");
            var wrapperH = document.createElement("h4");
            wrapperH.innerHTML = config.noAirplanes;
            wrapperLi.appendChild(wrapperH);
            list.appendChild(wrapperLi);
        }
        setButtonsState(false);
        setSpinner(false);
    }

    // get data failed
    function onErrorGetData(errorStatus) {
        // if user has no internet connection
        if (errorStatus === 0) {
            alert(config.checkNetwork);
        } else {
            // if some other error happened
            alert(config.errorOccurred);
        }
    }

    // set is loading to update UI - disable buttons
    function setButtonsState(isLoading) {
        if (isLoading) {
            geolocationAllowBtn.setAttribute("disabled", isLoading);
            geolocationDeniedBtn.setAttribute("disabled", isLoading);
        } else {
            geolocationAllowBtn.removeAttribute("disabled");
            geolocationDeniedBtn.removeAttribute("disabled");
        }
    }

    // on error get users location.
    // user denied to use geolocation, or some other unknown error...
    function onErrorGetLocation(error) {
        setButtonsState(false);
        if(error.code === 2) {
            alert(config.checkNetwork);
        } else {
            // if user clock geolocation
            locationDenied();
        }
    }

    // get users geolocation
    function getUserLocation() {
        if (navigator.geolocation) {
            // get user geolocation and call callback function
            setButtonsState(true);
            navigator.geolocation.getCurrentPosition(onSuccessGetLocation, onErrorGetLocation);
        } else {
            // geolocation is not supported by this broswer
            // we set a message to user, and remove buttons from DOM
            warningGeolocation.innerHTML = config.geolocationNotSupported;
        }
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





})()




