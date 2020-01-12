"use strict";

var RoonApi          = require("node-roon-api"),
    RoonApiTransport = require('node-roon-api-transport'),
    RoonApiSettings  = require('node-roon-api-settings'),
    RoonApiStatus    = require('node-roon-api-status');

var _core      = undefined;
var _transport = undefined;
var _output_id = "";
var _delay     = 0;
var _timer     = null;

var roon = new RoonApi({
    extension_id:        'org.bancofan.sleeptimer',
    display_name:        'Sleep Timer',
    display_version:     '1.0.0',
    publisher:           '',
    email:               'aleckrav@gmail.com',
    website:             'https://github.com/bancofan',

    core_paired: function(core) {
        _core      = core;
        _transport = _core.services.RoonApiTransport;
        console.log(core.core_id,
                    core.display_name,
                    core.display_version,
                    "-",
                    "PAIRED");
        
        _transport.subscribe_zones(function(cmd, data) {
            if (cmd == "Changed") {
                if (data.zones_changed) {
                    data.zones_changed.forEach(zone => {
                        zone.outputs.forEach(output => {
                            if (output.output_id == _output_id) {
                               console.log('********** Selected zone %d', _output_id) ;
                            }
                        });
                    });
                }    
            }
        });
        
    },

    core_unpaired: function(core) {
        _core      = undefined;
        _transport = undefined;
        console.log(core.core_id,
                    core.display_name,
                    core.display_version,
                    "-",
                    "LOST");
    }
});


var _mysettings = Object.assign({
    zone:             null,
    delay:            0
}, roon.load_config("settings") || {});

function makelayout(settings) {
    var l = {
             values:    settings,
             layout:    [],
             has_error: false
            };

    l.layout.push({
                    type:    "zone",
                    title:   "Zone",
                    setting: "outputid",
                  });

    l.layout.push({
    type:    "dropdown",
    title:   "Delay",
    values:  [
        { title: "Disable",     value: 0 },
        { title: "30 min",      value: 30 },
        { title: "60 min",      value: 60 },
        { title: "90 min",      value: 90},
        { title: "120 min",     value: 120 },
        { title: "150 min",     value: 150},
        { title: "180 min",     value: 180},
    ],
    setting: "delay",
    });

    return l;
}        

var svc_settings = new RoonApiSettings(roon, {
        get_settings: function(cb) {
        cb(makelayout(_mysettings));
    },
    save_settings: function(req, isdryrun, settings) {
        if (req.body.settings) {
            if (req.body.settings.values) {
                _output_id = req.body.settings.values["outputid"]["output_id"];
            }
        }    

        let l = makelayout(settings.values);
        req.send_complete(l.has_error ? "NotValid" : "Success", { settings: l });

        if (!isdryrun && !l.has_error) {
            _mysettings = l.values;
            svc_settings.update_settings(l);
            roon.save_config("settings", _mysettings);
            startSleepTimer();
        }
    }
});

function startSleepTimer()
{
    _delay = _mysettings.delay;
     
    if(_delay == 0 && _timer != null) { 
        clearTimeout(_timer);
        _timer = null;
    }      
    else {
        _timer = setTimeout(() => {
            if (_transport && _output_id) {
                _transport.control(_output_id, "stop");
                _mysettings.delay = 0;
                svc_settings.update_settings(makelayout(_mysettings));
                roon.save_config("settings", _mysettings);
                update_status();
            }
        }, _delay*60000);
    }
    update_status();
}  

var svc_status = new RoonApiStatus(roon); 

roon.init_services({
    required_services:   [ RoonApiTransport ],
    provided_services:   [ svc_settings, svc_status ]
});

function update_status() {
    if (_mysettings.delay == 0)
        svc_status.set_status("Sleep timer disabled", false);
    else
        svc_status.set_status("Sleep timer set to " + _mysettings.delay + " min", true);
}

roon.start_discovery();
update_status();
