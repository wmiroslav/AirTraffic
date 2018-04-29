"use strict";


(function() {

    Handlebars.registerHelper('direction', function(angle) {
        var iconClass;
        if (angle > 0 && angle < 180) {
            iconClass = 'east';
        } else {
            iconClass = 'west';
        }
        return iconClass;
    });

    var airplanes;
    var userPosition;
    var geolocationAllowBtn = document.getElementById('allowLocation');
    var geolocationDeniedBtn = document.getElementById('deniedLocation');
    var warningGeolocation = document.getElementById('warning');
    var loadingSpinner = document.getElementById('loading-spinner');
    var singleAirplane = document.getElementById('selected-airplane');
    var toastMessage = document.getElementById('toast');
    var toastWrapper = document.getElementById('toast-wrapper');
    toastWrapper.setAttribute("style", "display: none");
    var refreshedTime = document.getElementById('time');
    // for selected airplane
    var closeBtn = document.getElementById('close-airplane');
    var manufacture = document.getElementById('manufacture');
    var model = document.getElementById('model');
    var destination = document.getElementById('destination');
    var origin = document.getElementById('origin');
    var logo = document.getElementById('logo');
    //templates and template holders
    var listTemplate = document.getElementById("list-template");
    var airplaneDataTemplate = document.getElementById("airplane-data-template");
    var list = document.getElementById('list');
    var airplaneData = document.getElementById('airplane-data');




    // when user allow to get location
    geolocationAllowBtn.addEventListener("click", getUserLocation);



    // when user denied or block geolocation, show warning message:
    function locationDenied() {
        // we have a few random question, so we get some question...
        var numberOfQuestions = config.enableGeolocationQuestion.length;
        var i = Math.floor((Math.random() * numberOfQuestions));
        // ...and show this question to user
        warningGeolocation.innerHTML = config.enableGeolocationQuestion[i];
        warningGeolocation.classList.add('fadein');
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
        var url = config.baseUrl + "AircraftList.json?lat=" + userPosition.coords.latitude + "&lng=" + userPosition.coords.longitude + "&fDstL=0&fDstU=" + config.range;
        httpGetAsync(url, onSuccessGetData, onErrorGetData)
    }


    // set spinner on UI: indicator for loading data...
    function setSpinner(show) {
        var display = show ? "block" : "none";
        loadingSpinner.setAttribute("style", "display:" + display);
    }




    function closeModal() {
        singleAirplane.setAttribute("style", "display: none;");
        window.location.hash = 'airplanes';
    }
    singleAirplane.addEventListener('click', function(e){
        if (e.target.id == 'selected-airplane') {
            closeModal();
        }
    })
    closeBtn.addEventListener('click', closeModal)


    // on successfully retrieve all airplanes
    function onSuccessGetData(response) {
        // first remove old data:
        while (list.firstChild) {
            list.firstChild.remove();
        }

        // if there's results, add them to the DOM
        airplanes = response.acList.sortBy("Alt");
        var numberOfNewAirplanes = airplanes.length;
        if (numberOfNewAirplanes > 0) {
            // set refreshed time
            var d = new Date(); 
            refreshedTime.innerHTML = d.getHours() + "h " + d.getMinutes() + "min " + d.getSeconds()  + "s" ;
            // set results to DOM via Handlebars js:
            var html = listTemplate.innerHTML;
            var template = Handlebars.compile(html);
            var newHtml = template({
                airplanes: airplanes
            })
            list.innerHTML = newHtml;
        } else {
            toast(config.noData);
        }
        setButtonsState(false);
        setSpinner(false);
    }

    // get data failed
    function onErrorGetData(errorStatus) {
        setSpinner(false);
        toast(config.checkNetworkOrCORS);
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
        console.log(error);
        setButtonsState(false);
        // on local machine, browser do not remember if user allow or denied a geolocation
        // so in case that site is on live server, browser remember his decision
        // in that case, user need to clear browser setting - so wee send him a different message
        if (window.location.protocol === "file:") {
            locationDenied();
        } else {
            if (error.code === 2) {
                warningGeolocation.innerHTML = config.onErrorGetLocation + " " + config.noInternet;
            } else {
                warningGeolocation.innerHTML = config.onErrorGetLocation;
            }
            warningGeolocation.classList.add('fadein');
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

    function toast(message) {
        toastMessage.innerHTML = message;
        toastWrapper.setAttribute("style", "display: block;");
        setTimeout(function() {
            toastWrapper.setAttribute("style", "display: none;");
        }, 3000);
    }


    //////////////
    // ROUTING
    //////////////
    function getAirplaneData() {
        var id = window.location.hash.substr(1); // get ID from URL, from hash
        if (id && airplanes) {
            // find selected airplane
            var selectedAirplane;
            for (var i = 0, length = airplanes.length; i < length; i++) {
                if (airplanes[i].Id == id) {
                    selectedAirplane = airplanes[i];
                    break;
                }
            }
            // SHOW selecterd airplane
            if (selectedAirplane && singleAirplane) {
                singleAirplane.setAttribute("style", "display: block;");

                // some airplanes has no data, so instead od undefined, show nicer message in UI
                selectedAirplane.Man = selectedAirplane.Man || config.noData;
                selectedAirplane.Mdl = selectedAirplane.Mdl || config.noData;
                selectedAirplane.From = selectedAirplane.From || config.noData;
                selectedAirplane.To = selectedAirplane.To || config.noData;
                // generate icon logo URL
                if(selectedAirplane.Op) {
                    var genericUrl = selectedAirplane.Op.replace(/\s/g, '') + ".com";
                    var logoUrl = config.logoBaseUrl + (config.logo[selectedAirplane.Op] || genericUrl);
                    selectedAirplane.logoUrl = logoUrl;
                }
                // render it to the DOM via Handlebarsjs
                var html = airplaneDataTemplate.innerHTML;
                var template = Handlebars.compile(html);
                var newHtml = template(selectedAirplane);
                airplaneData.innerHTML = newHtml;
            } else {
                closeModal();
            }
        } else {
            closeModal();
        }
    }
    window.addEventListener('hashchange', getAirplaneData);
    
    list.addEventListener('click', function(e) {
        // get airplane ID from DOM
        var id = e.target.dataset.id || e.target.parentElement.dataset.id;
        // set url path (hash)
        window.location.hash = id;
    }, false);



   


    getAirplaneData(); //on init get data... for now it's pointless, because we don't store our geolocation and last results in local storage...
                        // so we could use: window.location.hash = ''; just to clean hash value...
})()




