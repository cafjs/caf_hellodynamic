var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');

var CodeEditor = {

    updateLocalCode: function(ev) {
        AppActions.setLocalState({
            code: this.refs.filter.getValue()
        });
    },

    render: function() {
        return cE(rB.Input, {
            type:'textarea',
            ref: 'filter',
            rows: 20,
            spellCheck:'false',
            className: 'javascript',
            value: this.props.code,
            onChange: this.updateLocalCode
        });
    }
};

module.exports = React.createClass(CodeEditor);
