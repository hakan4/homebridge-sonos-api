var request = require("request");
var Service, Characteristic;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-sonos-api", "SonosApi", SonosAccessory);
}

function SonosAccessory(log, config) {
    this.log = log;
    this.config = config;
    this.name = config["name"];

    this.service = new Service.Lightbulb(this.name);
    this.service
        .getCharacteristic(Characteristic.On)
        .on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
}

SonosAccessory.prototype.getOn = function(callback) {
    request.get({
        url: 'http://localhost:5005/Living Room/status'
    }, function(err, response, body) {
        callback(null, body.playbackState === 'PLAYING');
    }.bind(this));
}

SonosAccessory.prototype.setOn = function(on, callback) {
    const url = on ? 'favorite/starred' : 'stop';
    request.get({
        url: 'http://localhost:5005/Living Room/' + url
    }, function(err, response, body) {
        callback(null, on);
    }.bind(this));
}

SonosAccessory.prototype.getServices = function() {
    return [this.service];
}