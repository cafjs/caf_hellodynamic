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
var caf_iot = require('caf_iot');
var caf_comp = caf_iot.caf_components;
var myUtils = caf_comp.myUtils;

var sample = function(data, rate) {
    var newValues = data.values.filter(function(x) {
        return (x.index % rate === 0);
    }).map(function(x) {
        var newX = myUtils.deepClone(x);
        newX.index = newX.index / rate;
        return newX;
    });

    return  ((newValues.length > 0) ? {nextIndex:
                                       newValues[newValues.length -1].index + 1,
                                       values: newValues} :
             {nextIndex: Math.floor(data.nextIndex -1) + 1, values: []});
};

exports.methods = {
    '__iot_setup__' : function(cb) {
        this.$.zx.registerHandler('newData__noSync');
        this.state.data = {nextIndex: 0, values: []};
        this.state.acc = {};
        cb(null);
    },

    '__iot_loop__' : function(cb) {
        this.$.log && this.$.log.debug('Time offset ' + this.$.cloud.cli
                                       .getEstimatedTimeOffset());

        this.toCloud.set('detect', myUtils.deepClone(this.state.acc));
        this.toCloud.set('data', sample(this.state.data,
                                        this.$.props.sampleRate));

        this.state.data = {
            nextIndex: this.state.data.nextIndex,
            values: []
        };

        cb(null);
    },

    // Changes toCloud are ignored because zx handlers do not sync with cloud
    'newData__noSync' : function(dataPoint, cb) {
        if (this.toCloud.has('filter')) {
            var acc = this.toCloud.applyMethod('filter', [dataPoint,
                                                          this.state.acc]);
            if (acc) {
                this.state.acc = acc;
            }
        }

        this.state.data.values.push(dataPoint);
        this.state.data.nextIndex = dataPoint.index + 1;

        cb(null);
    }
};

caf_iot.init(module);
