var Service;
var Characteristic;
var UUIDGen

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    homebridge.registerAccessory("homebridge-togglesensorswitch", "ToggleSensorSwitch", ToggleSensorSwitchAccessory);
}

function ToggleSensorSwitchAccessory(log, config){
    this.log = log;
    this.name = config["name"];
    this.switchService = new Service.Switch(this.name);
    this.switchStatus = false;

    this.switchService
    	.getCharacteristic(Characteristic.On)
    	.on('get', this.getStatus.bind(this))
        .on('set', this.setStatus.bind(this));
        
    this.motionService = new Service.MotionSensor();
}

ToggleSensorSwitchAccessory.prototype.getStatus = function(callback) {
    callback(null, this.switchStatus);
}

ToggleSensorSwitchAccessory.prototype.setStatus = function(status, callback, context) {
	if(context !== 'fromSetValue') {
        this.switchStatus = status;
        if(this.switchStatus) {
            this.changeHandler();
        }
    }

    if (callback !== undefined) {
        callback();
    }
}

ToggleSensorSwitchAccessory.prototype.changeHandler = function(){
    var d = new Date();
    var newState = true;
    if(this.timer == undefined){
        this.motionService.getCharacteristic(Characteristic.MotionDetected)
                .setValue(newState);
    } else {
        clearTimeout(this.timer);
    }
    this.timer = setTimeout(function(){
        this.motionService.getCharacteristic(Characteristic.MotionDetected)
                .setValue(!newState);
        this.switchService.getCharacteristic(Characteristic.On).setValue(!newState);
        delete this.timer;
    }.bind(this), 2 * 1000);
}

ToggleSensorSwitchAccessory.prototype.getServices = function() {
	return [this.switchService, this.motionService];
}