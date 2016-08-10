var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var rC = require('recharts');

var WIDTH = 350;
var HEIGHT = 350;


var Detections = {
    render : function() {
        var data = this.props.detections || [];

        return  cE("div", null, 'Detections',
                   cE(rC.LineChart, {
                       width: WIDTH, height: HEIGHT,
                       layout: 'vertical',
                       data: data,
                       margin: {top: 5, right: 20, left: 20,
                                bottom: 5}
                   },
                      cE(rC.YAxis, {
                          dataKey: 'name', type: 'category'}),
                      cE(rC.XAxis, {
                          type: 'number', domain: ['dataMin',
                                                   'dataMax']}),
                      cE(rC.Tooltip, null),
                      cE(rC.CartesianGrid, { stroke: "#f5f5f5" }),
                      cE(rC.Line, { isAnimationActive: false,
                                    dataKey: "index",
                                    dot: {stroke: 'red',
                                          strokeWidth: 5}
                                  }
                        )
                     )
                  );
    }
};

module.exports = React.createClass(Detections);
