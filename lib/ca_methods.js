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

"use strict";
var caf = require('caf_core');
var app = require('../public/js/app.js');
var caf_comp = caf.caf_components;
var myUtils = caf_comp.myUtils;

var APP_SESSION = 'default';
var IOT_SESSION = 'iot';

var notifyIoT = function(self, msg) {
    var $$ = self.$.sharing.$;
    var notif = {msg: msg, fromCloud:  $$.fromCloud.dump()};
    self.$.session.notify([notif], IOT_SESSION);
};

var notifyWebApp = function(self, msg) {
    self.$.session.notify([msg], APP_SESSION);
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

exports.methods = {

    // Called by the framework

    '__ca_init__' : function(cb) {
        this.$.session.limitQueue(1, APP_SESSION); // only the last notification
        this.$.session.limitQueue(1, IOT_SESSION); // only the last notification
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();
        this.state.data = {nextIndex: 0, values: []};
        this.state.trace__iot_sync__ = 'traceSync';
        this.state.trace__iot_resume__ = 'traceResume';
        cb(null);
    },
    '__ca_pulse__' : function(cb) {
        this.$._.$.log && this.$._.$.log.debug('calling PULSE!!!');
        this.$.react.render(app.main, [this.state]);
        cb(null, null);
    },

    // Called by the web app

    'hello' : function(key, tokenStr, cb) {
        this.$.react.setCacheKey(key);
        this.$.iot.registerToken(tokenStr);
        this.getState(cb);
    },

    'getState' : function(cb) {
        this.$.react.coin();
        cb(null, this.state);
    },

    'changeFilter' : function(filter, cb) {
        var $$ = this.$.sharing.$;
        this.state.filter = filter;
        $$.fromCloud.setFun('filter', ['data', 'acc'], filter);
        notifyIoT(this, 'New filter');
        cb(null, this.state);
    },

    // Called by the IoT device

    'traceSync' : function(cb) {
        var $$ = this.$.sharing.$;
        var now = (new Date()).getTime();
        this.$.log.debug(this.state.fullName + ':Syncing!!:' + now);
        if (processData(this, $$.toCloud.get('data'))) {
            notifyWebApp(this, 'New inputs');
        }
        this.state.detect = myUtils.deepClone($$.toCloud.get('detect'));
        cb(null);
    },
    'traceResume' : function(cb) {
        var now = (new Date()).getTime();
        this.$.log.debug(this.state.fullName + ':Resuming!!:' + now);
        this.state.data = {nextIndex: 0, values: []};
        cb(null);
    }
};


caf.init(module);
