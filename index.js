var request = require("request");
var Service, Characteristic;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-sonos-api", "SonosApi", SonosAccessory);
}

function SonosAccessory(log, config) {
    console.log("CONFIG: ", config);

    this.log = log;
    this.config = config;
    this.name = config["name"];

    const rooms = config.rooms;
    const playlists = config.playlists;
    const services = rooms.map(room => {
        const playlistServices = playlists.map( playlist => {
            const service = new Service.Lightbulb(room + ' ' + playlist, room.toLowerCase() + playlist.toLowerCase());
            service.getCharacteristic(Characteristic.On)
                .on('get', setupGetOn(room, playlist))
                .on('set', setupSetOn(room, playlist));
            return service;
        });
        return playlistServices;
    });

    this.services = services.reduce((a, b) => { return a.concat(b); }) 
}


function setupGetOn(roomName, playlist) {
    console.log('created getOn  callback for room: ' + roomName);
    return (callback) => {
        console.log('function getOn call for room: ' + roomName);
        request.get({
            url: 'http://localhost:5005/' + roomName + '/state'
        }, (error, response, body) => {
            if(!error) {
                const state = JSON.parse(body);
                callback(null, state.playbackState === 'PLAYING');
            } else {
                console.log('Error: ' + error);
                callback(null, false);
            }
        });
    }
}

function setupSetOn(roomName, playlist) {
    console.log('created setOn callback for room: ' + roomName);
    return (on, callback) => {
        console.log('function setOn call for room: ' + roomName);
        request.get({
            url: 'http://localhost:5005/' + roomName + '/' + (on ? 'favorite/' + playlist : 'pause')
        }, (error, response, body) => {
            if(error) { 
                console.log('Error: ' + err);
            }
            callback(null, on);
        });
    }
}

SonosAccessory.prototype.getServices = function() {
    return this.services;
}