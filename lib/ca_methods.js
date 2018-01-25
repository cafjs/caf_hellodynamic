/*!
Copyright 2013 Hewlett-Packard Development Company, L.P.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';
var caf = require('caf_core');
var app = require('../public/js/app.js');
var caf_sharing = caf.caf_sharing;
var ReliableChannel = caf_sharing.ReliableChannel;

var APP_SESSION = 'default';
var IOT_SESSION = 'iot';
var DETECTIONS_CHANNEL_NAME = 'detectionsChannel';

var notifyIoT = function(self, msg) {
    var $$ = self.$.sharing.$;
    var notif = {msg: msg, fromCloud: $$.fromCloud.dump()};
    self.$.session.notify([notif], IOT_SESSION);
};

var notifyWebApp = function(self, msg) {
    self.$.session.notify([msg], APP_SESSION);
};

var processDetections = function(self, allMsg) {
    var data = allMsg.messages;
    var firstIndex = allMsg.index;
    data = data.map(function(x, i) {
        var id = firstIndex + i;
        return {name: 'e_'+ id, index: x};
    });
    if (data && (data.length > 0)) {
        var all = self.state.detections || [];
        all = all.concat(data).slice(-self.$.props.maxDetections);
        self.state.detections = all;
        return true;
    } else {
        return false;
    }
};

// data type is {nextIndex: number, values: Array<Object>}
var processData = function(self, data) {
    if (data && (data.nextIndex > self.state.data.nextIndex)) {
        var firstIndex = data.nextIndex - data.values.length;
        var gap = firstIndex - self.state.data.nextIndex;
        if (gap > 0) {
            // non-contiguous, ignore previous values
            self.state.data.values = data.values;
        } else {
            var fragLength = self.state.data.values.length + gap;
            if (fragLength > 0) {
                self.state.data.values =
                    self.state.data.values.slice(0, fragLength)
                    .concat(data.values);
            } else {
                // new values contain old ones
                self.state.data.values = data.values;
            }
        }
        self.state.data.values = self.state.data.values
            .slice(Math.max(0, self.state.data.values.length -
                            self.$.props.maxSamples));
        self.state.data.nextIndex = data.nextIndex;
        return true;
    } else {
        // reset cloud state
        self.state.data = {nextIndex: 0, values: []};
        return false;
    }
};

var extractFunctionBody = function(x) {
    if (x && (x.indexOf('function') !== -1)) {
        return x.substring(x.indexOf('{') + 1, x.lastIndexOf('}')).trim();
    } else {
        return x;
    }
};

exports.methods = {

    // Called by the framework

    '__ca_init__': function(cb) {
        this.$.session.limitQueue(1, APP_SESSION); // only the last notification
        this.$.session.limitQueue(1, IOT_SESSION); // only the last notification
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();
        this.state.data = {nextIndex: 0, values: []};
        this.state.detections = [];
        this.state.filter = '/** \n\
 * Detects a gesture.\n\
 * Executes in the device for faster data sampling.\n\
 * \n\
 * @param(data) A sensor datapoint with keys rawX, rawZ, index,\n\
 * z, x, dZ, and dX   (all values are numbers). \n\
 * @param(acc) An object, initially empty,  providing shared state \n\
 * across invocations.\n\
 * \n\
 * @returns  True for a detection. \n\
 **/\n\
 function(data, acc) { \n\
\n\
\n\
 }';
        this.state.trace__iot_sync__ = 'traceSync';
        this.state.trace__iot_resume__ = 'traceResume';
        cb(null);
    },
    '__ca_pulse__': function(cb) {
        this.$._.$.log && this.$._.$.log.debug('calling PULSE!!!');
        this.$.react.render(app.main, [this.state]);
        cb(null, null);
    },

    // Called by the web app

    'hello': function(key, tokenStr, cb) {
        this.$.react.setCacheKey(key);
        this.$.iot.registerToken(tokenStr);
        this.getState(cb);
    },

    'getState': function(cb) {
        this.$.react.coin();
        cb(null, this.state);
    },

    'changeFilter': function(filter, cb) {
        var $$ = this.$.sharing.$;
        this.state.filter = filter;
        $$.fromCloud.setFun('filter', ['data', 'acc'],
                            extractFunctionBody(filter));
        notifyIoT(this, 'New filter');
        cb(null, this.state);
    },

    // Called by the IoT device

    'traceSync': function(cb) {
        var $$ = this.$.sharing.$;
        var now = (new Date()).getTime();
        this.$.log.debug(this.state.fullName + ':Syncing!!:' + now);
        var detections = ReliableChannel.receive($$.fromCloud, $$.toCloud,
                                                 DETECTIONS_CHANNEL_NAME);
        var change = processDetections(this, detections);
        if (processData(this, $$.toCloud.get('data')) || change) {
            notifyWebApp(this, 'New inputs');
        }
        cb(null);
    },
    'traceResume': function(cb) {
        var now = (new Date()).getTime();
        this.$.log.debug(this.state.fullName + ':Resuming!!:' + now);
        this.state.data = {nextIndex: 0, values: []};
        cb(null);
    }
};


caf.init(module);
