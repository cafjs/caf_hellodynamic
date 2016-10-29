var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var rC = require('recharts');

var WIDTH = 350;
var HEIGHT = 350;
var TICKS_INTERVAL = 10; // need to set this to match server-side rendering


var ZXChart = {
    render : function() {
        return cE(rB.Grid, {fluid: true},
                  cE(rB.Row, null,
                     cE(rB.Col, {sm:6, xs:12},
                        cE("div", null,
                           'X (green) and Z (red) position values',
                           cE(rC.LineChart, {
                               width: WIDTH, height: HEIGHT,
                               data: this.props.data,
                               margin: {top: 5, right: 5, left: 5,
                                        bottom: 5}
                           },
                              cE(rC.YAxis, null),
                              cE(rC.XAxis, {  interval: TICKS_INTERVAL,
                                              dataKey: "index" }),
                              cE(rC.Tooltip, null),

                              /* cE(rC.Legend, {align: "center",
                               verticalAlign: "middle",
                               layout: "horizontal"}),
                               */
                              cE(rC.CartesianGrid, { stroke: "#f5f5f5" }),
                              cE(rC.Line, { isAnimationActive: false,
                                            name: 'Z',
                                            type: "monotone", dataKey: "z",
                                            stroke: "#ff7300"}),

                              cE(rC.Line, { isAnimationActive: false,
                                            name: 'X',
                                            type: "monotone", dataKey: "x",
                                            stroke: "#387908"})
                             )
                          )
                       ),
                     cE(rB.Col, {sm:6, xs:12},
                        cE("div", null,
                           'First derivatives of X (green) and Z (red)',
                           cE(rC.LineChart, { width: WIDTH, height: HEIGHT,
                                              data: this.props.data,
                                              margin: {top: 5, right: 5,
                                                       left: 5,
                                                       bottom: 5}
                                            },
                              cE(rC.Tooltip, null),
                              cE(rC.YAxis, null),
                              cE(rC.XAxis, { interval: TICKS_INTERVAL,
                                             dataKey: "index" }),
                              /* cE(rC.Legend, {align: "center",
                               verticalAlign: "middle",
                               layout: "vertical"}),
                               */
                              cE(rC.CartesianGrid, { stroke: "#f5f5f5" }),
                              cE(rC.Line, { isAnimationActive: false,
                                            name: 'dZ',
                                            type: "monotone", dataKey: "dZ",
                                            stroke: "#ff7300"}),

                              cE(rC.Line, { isAnimationActive: false,
                                            name: 'dX',
                                            type: "monotone", dataKey: "dX",
                                            stroke: "#387908"})
                             )
                          )
                       )
                    )
                 );
    }
};

module.exports = React.createClass(ZXChart);
