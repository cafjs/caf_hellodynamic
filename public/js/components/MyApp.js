var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppStore = require('../stores/AppStore');
var AppActions = require('../actions/AppActions');
var AppStatus = require('./AppStatus');
var DisplayError = require('./DisplayError');
var ZXChart = require('./ZXChart');
var CodeEditor = require('./CodeEditor');
var Detections  = require('./Detections');

var MyApp = {
    getInitialState: function() {
        return AppStore.getState();
    },
    componentDidMount: function() {
        AppStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
        AppStore.removeChangeListener(this._onChange);
    },
    _onChange : function(ev) {
        this.setState(AppStore.getState());
    },

    doReset: function(ev) {
        AppActions.setLocalState({
            code: this.state.filter
        });
    },

    doUpdate: function(ev) {
        AppActions.changeFilter(this.state.code);
    },

    render: function() {
        return cE("div", {className: "container-fluid"},
                  cE(DisplayError, {
                      error: this.state.error
                  }),
                  cE(rB.Panel, {
                      header: cE(rB.Grid, null,
                                 cE(rB.Row, null,
                                    cE(rB.Col, {sm:1, xs:1},
                                       cE(AppStatus, {
                                           isClosed: this.state.isClosed
                                       })
                                      ),
                                    cE(rB.Col, {
                                        sm: 5,
                                        xs:10,
                                        className: 'text-right'
                                    }, "Dynamic IoT Example"),
                                    cE(rB.Col, {
                                        sm: 5,
                                        xs:11,
                                        className: 'text-right'
                                    }, this.state.fullName)
                                   )
                                )
                  },
                     cE(rB.Panel, {header: "ZX Sensor Data"},
                        cE(ZXChart, {
                            data: this.state.data.values
                        })),
                     cE(rB.Panel, {header: "Device Local Filtering"},
                        cE(rB.Grid, null,
                            cE(rB.Row, null,
                               cE(rB.Col, {sm:6, xs:12},
                                  cE(CodeEditor, {
                                      code: this.state.code || this.state.filter
                                  })
                                 ),
                               cE(rB.Col, {sm:6, xs:12},
                                  cE(Detections, {
                                      detections: this.state.detections
                                  })
                                 )
                              ),
                           cE(rB.Row, null,
                              cE(rB.Col, {sm:3, xs:12},
                                 cE(rB.Button, {onClick: this.doReset},
                                    "Reset"),
                                 cE(rB.Button, {bsStyle: 'danger',
                                                onClick: this.doUpdate},
                                    "Update")
                                )
                             )
                          )
                       )
                    )
                 );
    }
};

module.exports = React.createClass(MyApp);
