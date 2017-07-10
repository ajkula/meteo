var observable = require("data/observable");
var fetchModule = require("fetch");
var moment = require('moment');
var mapbox = require("nativescript-mapbox");
var dialogs = require("ui/dialogs");
var platform = require("platform");
var isIOS = platform.device.os === platform.platformNames.ios;
var appSettings = require('application-settings');
var FeedbackPlugin = require("nativescript-feedback");
var feedback = new FeedbackPlugin.Feedback();
var color = require('color');
var application = require("application");
var themes = require('./themes').themes;
// var fileName = application.getCssFileName();
// console.dump(application);
var geolocation = require("nativescript-geolocation");
geolocation.enableLocationRequest(true);

Array.prototype.poop = function() {
    if (this.length) {
        let result = this[this.length - 1];
        this.length = this.length - 1;
        return result;
    } else return undefined;
}

Array.prototype.clean = function(deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};

var MapModel = (function(_super) {
    __extends(MapModel, _super);



    function MapModel() {
        _super.call(this);
    }

    // Ma clé perso :
    const accessToken = 'pk.eyJ1IjoiYWprdWxhIiwiYSI6ImNqMXMwNmJoaDAwMDUzM24weHZnNzZoZzQifQ.LRk5Zs5fSHf2Ae1Na4zAKg';
    var newMarker = [];
    const vert = '#009900';
    const bleu = 'dodgerblue';
    const marron = '#734d26';
    var nav = 1;

    const iconPath = 'res://icons/'

    function startTheme() {
        console.log("startTheme!!")

        if (appSettings.getString("theme") !== undefined) {
            if (appSettings.getString("theme") === "emerald") {
                // this.set("theme", "EMERALD");
                // application.addCss("page {background-color: #ece8df;}");
                // appSettings.setString("theme", mapbox.MapStyle.EMERALD)

                return appSettings.getString("theme");
            } else {
                // this.set("theme", "DARK");
                // application.addCss("page {background-color: #333333;}");
                // appSettings.setString("theme", mapbox.MapStyle.DARK)
                return appSettings.getString("theme");
            }

        } else {
            // this.set("theme", "DARK");
            // application.addCss("page {background-color: #333333;}");
            appSettings.setString("theme", mapbox.MapStyle.DARK)
            return appSettings.getString("theme");
        }
    }
    // console.dump(appSettings.getString("theme"))

    MapModel.prototype.onThemeSwitch = function() {
        // console.dump(this.theme)
        if (this.theme === "DARK") {
            mapbox.setMapStyle(mapbox.MapStyle.EMERALD),
                this.set("theme", "EMERALD");
            // application.addCss("page {background-color: #ece8df;}");
            appSettings.setString("theme", mapbox.MapStyle.EMERALD)
                // this._emit("theme", this.theme)
                // application.loadCss()
        } else {
            mapbox.setMapStyle(mapbox.MapStyle.DARK),
                this.set("theme", "DARK");
            // application.addCss("page {background-color: #333333;}");
            appSettings.setString("theme", mapbox.MapStyle.DARK)
                // this._emit("theme", this.theme)
                // console.dump(themes.dark)
        }
    }

    // dialogs.alert({
    //             title: "Download error",
    //             message: error,
    //             okButtonText: "Got it"
    //         });

    function zoomTarget(data) {
        switch (data) {   
            case 3:
                return 8;          
            case 8:
                return 13;          
            case 13:
                return 3;
            default:
                return 3;
        }
    }

    function description(string) {
        var substring1 = "intensity "
        var substring2 = " with"
        var substring3 = " with light"
        var substring4 = " with medium"
        var substring5 = " with heavy"
        var substring6 = "thunderstorm light"
        var substring7 = "thunderstorm medium"
        var substring8 = "thunderstorm heavy"
        var thunder = "thunderstorm";

        if (string.indexOf(substring1) !== -1) {
            return string.split(substring1).join("")
        } else if (string.indexOf(substring2) !== -1) {
            return string.split(substring2).join("")
        } else if (string.indexOf(substring3) !== -1) {
            return string.split(substring3).join("")
        } else if (string.indexOf(substring4) !== -1) {
            return string.split(substring4).join("")
        } else if (string.indexOf(substring5) !== -1) {
            return string.split(substring5).join("")
        } else if (string.indexOf(substring6) !== -1) {
            return thunder + string.split(substring6)
                // return string.replace(substring6, thunder);
                // return string.split(substring6).join("thunderstorm")
        } else if (string.indexOf(substring7) !== -1) {
            return thunder + string.split(substring7)
        } else if (string.indexOf(substring8) !== -1) {
            return thunder + string.split(substring8)
        } else return string;

    }

    function errordialog(error) {
        feedback.show({
            title: "error / erreur :",
            icon: "erroricon",
            backgroundColor: new color.Color('red'),
            message: error,
            //type: feedback.success(),
            titleColor: new color.Color('white'),
            messageColor: new color.Color('white'),
            duration: 800,
            onTap: () => {
                // console.dump(feedback);
                feedback.hide();
            }
        }); // feedback
    }


    function wentWell(stringer) {
        feedback.show({
            title: "POSITION CLIQUEE!",
            icon: "successicon",
            backgroundColor: new color.Color('#009900'),
            message: [stringer] + " OK !",
            //type: feedback.success(),
            titleColor: new color.Color('white'),
            messageColor: new color.Color('white'),
            duration: 600,
            onTap: () => {
                // console.dump(feedback);
                feedback.hide();
            }
        }); // feedback
    }

    function listener(point) {
        feedback.show({
            title: "POSITION CLIQUEE!",
            icon: "successicon",
            backgroundColor: new color.Color('#734d26'),
            message: "Emplacement cliqué:\nlon: " + point.lng + "\nlat: " + point.lat + "'",
            //type: feedback.success(),
            titleColor: new color.Color('white'),
            messageColor: new color.Color('white'),
            duration: 500,
            onTap: () => {
                // console.dump(feedback);
                feedback.hide();
            }
        }); // feedback
    }


    var onTap = function(marker) {
        // console.log("Marker tapped with title: '" + marker.title + "'");
    };
    var onCalloutTap = function(marker) {
        wentWell("Marker callout: '" + marker.title + "'");
    };

    if (appSettings.hasKey("markersArray") === true) {
        markersArray = appSettings.getString("markersArray");
        test = true;
    } else {
        markersArray = [];
    }

    if (typeof markersArray === "string") {
        markersArray = JSON.parse(markersArray);
    }

    var icons = transformMarkers();

    function transformMarkers() {
        console.log("transformMarkers!!")
            // var newArray = [];

        if (markersArray.length >= 1) {
            markersArray.clean(null);
            console.dump(markersArray.length)
            console.dump(markersArray)
                // let id = 0;
            markersArray.forEach(
                function(elem, index) {
                    console.dump(elem)
                    let compteur = index + 1;
                    fetch("http://api.openweathermap.org/data/2.5/weather?lat=" + elem.lat + "&lon=" + elem.lng + "&appid=7431d386218c6bc0943c880b3c81b868")
                        .then(handleErrors)
                        .then(function(response) {
                            return response.json();
                        })
                        .then(function(data) {
                            console.log(data.weather[0].icon)
                                //   MapModel.doSetCenter(data);

                            elem = {
                                id: compteur,
                                lat: elem.lat,
                                lng: elem.lng,
                                title: data.name, // no popup unless set
                                subtitle: 'Température :' + Math.round(data.main.temp - 273.15) + " °C",
                                icon: 'http://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/' + data.weather[0].icon + '.png',
                                // icon: iconPath + data.weather[0].icon + '.png',
                                onTap: onTap,
                                onCalloutTap: onCalloutTap
                            }
                            console.dump(elem)
                            markersArray[compteur - 1] = elem;
                            // console.dump(elem)

                        });

                }); // forEach

            return markersArray;
        }

        // newMarker = {
        //         id: 4,
        //         lat: point.lat,
        //         lng: point.lng,
        //         title: data.name, // no popup unless set
        //         subtitle: 'Température :'+ Math.round(data.main.temp - 273.15) + " °C",
        //         icon: 'http://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/' + data.weather[0].icon + '.png',
        //         onTap: onTap,
        //         onCalloutTap: onCalloutTap
        //     }
    }

    MapModel.prototype.onLocalize = function() {
        // if (!geolocation.isEnabled()) {
        //     geolocation.enableLocationRequest();
        // }
        console.log("passe!")
        console.log(geolocation.isEnabled())
            // mapbox.hasFineLocationPermission().then((res) => { console.dump(res) });
            // if (geolocation.isEnabled()) {
            //     geolocation.getCurrentLocation().then((loc) => console.log(loc));
            // }
            // if (geolocation.isEnabled()) {
            // var location = 
        var location = geolocation.getCurrentLocation({ desiredAccuracy: 1, updateDistance: 0.1, maximumAge: 5000, timeout: 20000 }).
        then(function(loc) {
            // if (loc) {
            console.log("Current location is: " + loc);
            // }
        }, function(e) {
            console.log("Error: " + e.message);
        });
        console.log("fin!")
            // }
    }

    MapModel.prototype.onDelete = function() {
        if (markersArray.length) {
            var last = markersArray.poop();
            // console.dump(last);
            appSettings.setString("markersArray", JSON.stringify(markersArray));
            mapbox.removeMarkers([last.id]).then(() => {
                wentWell("MARKER n°" + last.id + " REMOVED");
            });
        } else {
            errordialog("NO MARKERS !")
        }
    }

    MapModel.prototype.onSave = function() {
        // console.dump(this.point)
        if (this.point) {
            if (markersArray.length < 1 || typeof markersArray !== "object") markersArray = [];
            let id = markersArray.length + 1
            let newElem = {
                id: id,
                lat: this.point.lat,
                lng: this.point.lng
            };
            markersArray.push(newElem);
            appSettings.setString("markersArray", JSON.stringify(markersArray));
            // console.dump(markersArray.length)

            markersArray = transformMarkers();
            // console.dump(typeof markersArray)
            this.notify({
                eventName: "Marker",
                object: markersArray[markersArray.length - 1]
            });
            setTimeout(function() {
                mapbox.addMarkers(markersArray).then(

                    function(result) {
                        wentWell("CREATION");
                        // mapbox.setMapStyle(mapbox.MapStyle.DARK);

                    },
                    function(error) {
                        errordialog(error)
                    }
                );
            }, 1000);

        }
    };

    MapModel.prototype.doShow = function() {
        console.dump(transformMarkers())
        this.set("theme", "DARK");
        this.set("temperature", "       Search places!");
        this.set("pressure", "");
        this.set("humidity", "   Make Markers!");
        this.set("zoomed", 10);
        this.set("temp_min", "");
        this.set("temp_max", "   Travel Markers!");
        this.set("sunrise", "     See the Weather!");
        this.set("description", "");
        this.set("sunset", "");
        // this.set("city", "Nom de la ville");city = "";
        var that = this;
        // let array = transformMarkers()
        if (icons) { this.set("test", true) } else this.set("test", false)
            // console.dump(transformMarkers());

        // console.dump(markersArray)
        mapbox.show({
            accessToken: accessToken,
            style: startTheme(),
            margins: {
                left: 0,
                right: 0,
                top: isIOS ? 400 : 220,
                bottom: isIOS ? 50 : 1
            },
            center: {
                lat: 48.86221418134531,
                lng: 2.344430294592712
            },
            zoomLevel: 9, // 0 (most of the world) to 20, default 0
            showUserLocation: true, // default false
            hideAttribution: true, // default false
            hideLogo: true, // default false
            hideCompass: false, // default false
            disableRotation: false, // default false
            disableScroll: false, // default false
            disableZoom: false, // default false
            disableTilt: false, // default false
            markers: icons
        }).then(
            function(result) {
                that.on("Marker", function(eventData) {
                    console.dump(eventData)
                        // console.log("result", appSettings.setString("markersArray"))
                        // mapbox.setMapStyle(mapbox.MapStyle.DARK);
                        // test events observable

                    // mapbox.addMarkers(markers),
                    //     console.log(transformMarkers())
                });
                // listener()
                mapbox.setOnMapClickListener(function(point) {
                    // console.dump(point)
                    listener(point);
                    that.set("point", point);
                    fetch("http://api.openweathermap.org/data/2.5/weather?lat=" + point.lat + "&lon=" + point.lng + "&appid=7431d386218c6bc0943c880b3c81b868")
                        .then(handleErrors)
                        .then(function(response) {
                            return response.json();
                        })
                        .then(function(data) {
                            //   MapModel.doSetCenter(data);
                            // console.dump(data);
                            that.set("temperature", Math.round(data.main.temp - 273.15) + " °C");
                            that.set("pressure", "Pression: " + data.main.pressure);
                            that.set("humidity", "Taux d'humidité: " + data.main.humidity);
                            that.set("temp_min", "Minimale: " + Math.round(data.main.temp_min - 273.15) + " °C");
                            that.set("temp_max", "Maximale: " + Math.round(data.main.temp_max - 273.15) + " °C");
                            that.set("sunrise", "Jour : " + time(parseInt(data.sys.sunrise)));
                            that.set("sunset", "Soir : " + time(parseInt(data.sys.sunset)));
                            that.set("description", description(data.weather[0].description));
                            that.set("city", data.name);
                        });

                });

                // mapbox.removeMarkers(() => {
                //     return icons;
                // }).then(() => {
                // mapbox.addMarkers([markersArray[markersArray.length - 1]]);
                // })

                setTimeout(function() {
                    mapbox.setTilt({
                        tilt: 85,
                        duration: 1000
                    });
                }, 500);
            },
            function(error) {
                errordialog(error);
            }
        );
    };

    MapModel.prototype.onNavigate = function() {
        var that = this;
        nav++;
        // console.dump(markersArray.length)
        if (markersArray.length >= 1) {
            if (nav >= markersArray.length) {
                nav = 0
            }
            // console.dump(nav)
            that.set("point", {
                lat: markersArray[nav].lat,
                lng: markersArray[nav].lng
            })
            mapbox.setCenter({
                    lat: markersArray[nav].lat,
                    lng: markersArray[nav].lng, // mandatory
                    animated: true, // default true
                }).then(
                    setTimeout(function() {
                        mapbox.setTilt({
                            tilt: 85,
                            duration: 1000
                        });
                    }, 1000),

                    fetch("http://api.openweathermap.org/data/2.5/weather?lat=" + that.point.lat + "&lon=" + that.point.lng + "&appid=7431d386218c6bc0943c880b3c81b868")
                    .then(handleErrors)
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(data) {
                        //   MapModel.doSetCenter(data);
                        // console.dump(data);
                        that.set("temperature", Math.round(data.main.temp - 273.15) + " °C");
                        that.set("pressure", "Pression: " + data.main.pressure);
                        that.set("humidity", "Taux d'humidité: " + data.main.humidity);
                        that.set("temp_min", "Minimale: " + Math.round(data.main.temp_min - 273.15) + " °C");
                        that.set("temp_max", "Maximale: " + Math.round(data.main.temp_max - 273.15) + " °C");
                        that.set("sunrise", "Jour : " + time(parseInt(data.sys.sunrise)));
                        that.set("sunset", "Soir : " + time(parseInt(data.sys.sunset)));
                        that.set("description", description(data.weather[0].description));
                        that.set("city", data.name);
                    })

                ) // mapbob.setCenter
        } else {
            nav = 0;
            errordialog("NO MARKERS !");
        }
    }

    MapModel.prototype.onZoom = function(args) {
        // console.dump(mapbox);

        let zlvl = zoomTarget(this.zoomed);
        mapbox.setZoomLevel({
            level: zlvl,
            animated: true
        });
        this.set("zoomed", zlvl);
        // console.dump(zlvl);
    }

    function handleErrors(response) {
        if (!response.ok) {
            errordialog(JSON.stringify(response.status + " " + response.statusText));
            throw Error(response.statusText);
        }
        return response;
    }

    function time(s) {
        return moment.unix(s).format("HH:mm");
    }

    MapModel.prototype.onTap = function(args) {
        var that = this;
        page = args.object;
        var text = this.city;
        if (typeof text === "undefined") text = "";
        text.trim().toString();
        // var regex = new RegExp('/^\n{5},[A-Za-z]{2}$/');
        // console.log(regex);
        // console.dump(this.city);
        return fetch("http://api.openweathermap.org/data/2.5/weather?q=" + text + "&appid=7431d386218c6bc0943c880b3c81b868")
            .then(handleErrors)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                console.dump(data)
                    // console.dump(mapbox._markers[0]);
                that.set("temperature", Math.round(data.main.temp - 273.15) + " °C");
                that.set("pressure", "Pression: " + data.main.pressure);
                that.set("humidity", "Taux d'humidité: " + data.main.humidity);
                that.set("temp_min", ("Minimale: " + Math.round(data.main.temp_min - 273.15) + " °C"));
                that.set("temp_max", ("Maximale: " + Math.round(data.main.temp_max - 273.15) + " °C"));
                that.set("sunrise", "Jour : " + time(parseInt(data.sys.sunrise)));
                that.set("sunset", "Soir : " + time(parseInt(data.sys.sunset)));
                that.set("description", description(data.weather[0].description));

                that.set("point", {
                    lat: data.coord.lat,
                    lng: data.coord.lon
                });

                mapbox.setCenter({
                    lat: data.coord.lat,
                    lng: data.coord.lon, // mandatory
                    animated: true, // default true
                });
            });
    };

    MapModel.prototype.doHide = function() {
        mapbox.hide().then(
            function(result) {
                console.log("Mapbox hide done");
            },
            function(error) {
                console.log("mapbox hide error: " + error);
            }
        );
    };

    MapModel.prototype.doDestroy = function() {
        mapbox.destroy().then(
            function(result) {
                console.log("Mapbox destroyed");
            },
            function(error) {
                console.log("mapbox destroy error: " + error);
            }
        );
    };

    MapModel.prototype.doUnhide = function() {
        mapbox.unhide().then(
            function(result) {
                console.log("Mapbox doUnhide done");
            },
            function(error) {
                console.log("mapbox doUnhide error: " + error);
            }
        );
    };

    MapModel.prototype.doRemoveAllMarkers = function() {
        mapbox.removeMarkers().then(
            function(result) {
                console.log("Mapbox doRemoveAllMarkers done");
            },
            function(error) {
                console.log("mapbox doRemoveAllMarkers error: " + error);
            }
        );
    };

    MapModel.prototype.doRemove2Markers = function() {
        mapbox.removeMarkers([
            1,
            2
        ]).then(
            function(result) {
                console.log("Mapbox doRemove2Markers done");
            },
            function(error) {
                console.log("mapbox doRemove2Markers error: " + error);
            }
        );
    };

    // MapModel.prototype.doAddMarkers = function() {


    //     mapbox.addMarkers([]).then(
    //         function(result) {
    //             console.log("Mapbox addMarkers done");
    //         },
    //         function(error) {
    //             console.log("mapbox addMarkers error: " + error);
    //         }
    //     );
    // };

    MapModel.prototype.doGetViewport = function() {
        mapbox.getViewport().then(
            function(result) {
                dialogs.alert({
                    title: "Viewport determined",
                    message: JSON.stringify(result),
                    okButtonText: "OK"
                });
            },
            function(error) {
                console.log("mapbox doGetViewport error: " + error);
            }
        );
    };

    MapModel.prototype.doSetViewport = function() {
        mapbox.setViewport({
            bounds: {
                north: 52.4820,
                east: 5.1087,
                south: 52.2581,
                west: 4.6816
            },
            animated: true // default true
        }).then(
            function() {
                console.log("Viewport set");
            },
            function(error) {
                console.log("mapbox doSetViewport error: " + error);
            }
        );
    };

    // Add an option to download the current viewport: https://www.mapbox.com/ios-sdk/examples/offline-pack/ (look for visibleCoordinateBounds)
    MapModel.prototype.doDownloadAmsterdam = function() {
        mapbox.downloadOfflineRegion({
            // required for Android in case no map has been shown yet
            accessToken: accessToken,
            name: "Amsterdam",
            style: mapbox.MapStyle.EMERALD,
            minZoom: 9,
            maxZoom: 11,
            bounds: {
                north: 52.4820,
                east: 5.1087,
                south: 52.2581,
                west: 4.6816
            },
            onProgress: function(progress) {
                console.log("Download progress: " + JSON.stringify(progress));
            }
        }).then(
            function() {
                dialogs.alert({
                    title: "Offline region downloaded",
                    message: "Done! Zoom levels 9-11 have been downloaded. The download progress was reported via console.log",
                    okButtonText: "OK"
                });
            },
            function(error) {
                console.log("mapbox doDownloadAmsterdam error: " + error);
            }
        );

        dialogs.alert({
            title: "Be patient",
            message: "This takes a while, progress is logged via console.log",
            okButtonText: "Understood"
        });
    };

    MapModel.prototype.doDownloadCurrentViewportAsOfflineRegion = function() {
        mapbox.getViewport().then(function(viewport) {
            mapbox.downloadOfflineRegion({
                name: "LastViewport",
                style: mapbox.MapStyle.EMERALD,
                minZoom: viewport.zoomLevel,
                maxZoom: viewport.zoomLevel + 2,
                bounds: viewport.bounds,
                onProgress: function(progress) {
                    console.log("Download progress: " + JSON.stringify(progress));
                }
            }).then(
                function() {
                    dialogs.alert({
                        title: "Viewport downloaded",
                        message: "Downloaded viewport with bounds " + JSON.stringify(viewport.bounds) + " at zoom levels " + viewport.zoomLevel + " - " + (viewport.zoomLevel + 2),
                        okButtonText: "OK :)"
                    });
                },
                function(error) {
                    console.log("mapbox doDownloadCurrentViewportAsOfflineRegion error: " + error);
                }
            );
        }, function(error) {
            dialogs.alert({
                title: "Download error",
                message: error,
                okButtonText: "Got it"
            });
        });
    };

    MapModel.prototype.doAddAndClusterGeoJSON = function() {
        mapbox.addGeoJsonClustered({
            name: "earthquakes",
            data: "https://www.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson",
            clusterMaxZoom: 15,
            clusterRadius: 20
                // clusters: [
                //   {}
                // ]
        }).then(
            function() {
                dialogs.alert({
                    title: "GeoJSON added",
                    message: "Moving to the USA as that's where the GeoJson data is drawn",
                    okButtonText: "OK"
                }).then(function() {
                    mapbox.setViewport({
                        bounds: {
                            north: 52.9,
                            east: -62.2,
                            south: 22.1,
                            west: -128.2
                        },
                        zoomLevel: 3
                    })
                });
            },
            function(error) {
                console.log("mapbox doAddAndClusterGeoJSON error: " + error);
            }
        );
    };

    MapModel.prototype.doListOfflineRegions = function() {
        mapbox.listOfflineRegions().then(
            function(regions) {
                dialogs.alert({
                    title: "Offline regions",
                    message: JSON.stringify(regions),
                    okButtonText: "Thanks"
                });
            },
            function(error) {
                dialogs.alert({
                    title: "Offline regions list error",
                    message: error,
                    okButtonText: "Hmm"
                });
            }
        );
    };

    MapModel.prototype.doDeleteOfflineRegion = function() {
        mapbox.deleteOfflineRegion({
            name: "Amsterdam"
        }).then(
            function() {
                dialogs.alert({
                    title: "Offline region deleted",
                    okButtonText: "Cool"
                });
            },
            function(error) {
                dialogs.alert({
                    title: "Error deleting offline region",
                    message: error,
                    okButtonText: "Hmmz"
                });
            }
        );
    };

    MapModel.prototype.doSetTilt = function() {
        mapbox.setTilt({
            tilt: 35,
            duration: 4000
        }).then(
            function(result) {
                console.log("Mapbox doSetTilt done");
            },
            function(error) {
                console.log("mapbox doSetTilt error: " + error);
            }
        );
    };

    MapModel.prototype.doAnimateCamera = function() {
        mapbox.animateCamera({
            target: {
                lat: 52.3732160,
                lng: 4.8941680,
            },
            zoomLevel: 17, // Android
            altitude: 500, // iOS
            bearing: 270,
            tilt: 50,
            duration: 10000
        }).then(
            function(result) {
                console.log("Mapbox doAnimateCamera done");
            },
            function(error) {
                console.log("mapbox doAnimateCamera error: " + error);
            }
        );
    };

    MapModel.prototype.doSetCenter = function() {
        mapbox.setCenter({
            lat: 52.3602160,
            lng: 4.8891680,
            animated: true
        }).then(
            function(result) {
                console.log("Mapbox setCenter done");
            },
            function(error) {
                console.log("mapbox setCenter error: " + error);
            }
        );
    };

    MapModel.prototype.doGetCenter = function() {
        mapbox.getCenter().then(
            function(result) {
                dialogs.alert({
                    title: "Center",
                    message: JSON.stringify(result),
                    okButtonText: "OK"
                });
            },
            function(error) {
                console.log("mapbox getCenter error: " + error);
            }
        );
    };

    MapModel.prototype.doGetZoomLevel = function() {
        mapbox.getZoomLevel().then(
            function(result) {
                dialogs.alert({
                    title: "Zoom Level",
                    message: JSON.stringify(result),
                    okButtonText: "OK"
                });
            },
            function(error) {
                console.log("mapbox getCenter error: " + error);
            }
        );
    };

    MapModel.prototype.doSetZoomLevel = function() {
        mapbox.setZoomLevel({
            level: 2, // shows most of the world
            animated: true
        }).then(
            function(result) {
                console.log("Mapbox setZoomLevel done");
            },
            function(error) {
                console.log("mapbox setZoomLevel error: " + error);
            }
        );
    };

    MapModel.prototype.doAddPolygon = function() {
        mapbox.addPolygon({
            points: [{
                    lat: 52.3832160,
                    lng: 4.8991680
                },
                {
                    lat: 52.3632160,
                    lng: 4.9011680
                },
                {
                    lat: 52.3932160,
                    lng: 4.8911680
                }
            ]
        }).then(
            function(result) {
                console.log("Mapbox addPolygon done");
            },
            function(error) {
                console.log("mapbox addPolygon error: " + error);
            }
        );
    };

    MapModel.prototype.doCheckHasFineLocationPermission = function() {
        mapbox.hasFineLocationPermission().then(
            function(granted) {
                dialogs.alert({
                    title: "Permission granted?",
                    message: granted ? "YES" : "NO",
                    okButtonText: "OK"
                });
            }
        );
    };

    MapModel.prototype.doRequestFineLocationPermission = function() {
        mapbox.requestFineLocationPermission().then(
            function() {
                console.log("Fine Location permission requested");
            }
        );
    };

    return MapModel;
})(observable.Observable);
exports.MapModel = MapModel;
exports.mainViewModel = new MapModel();