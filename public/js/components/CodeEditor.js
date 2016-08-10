var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');
var CodeMirror = require('react-code-mirror');

if (typeof document !== 'undefined') {
    // require('codemirror/mode/javascript/javascript');
}

var CodeEditor = {

    updateLocalCode: function(ev) {
        AppActions.setLocalState({
            code: ev.target.value
        });
    },

    render: function() {
        return cE(CodeMirror, {
            forceTextArea: true,
            style: {border: '1px solid black'},
            textAreaClassName: ['form-control'],
            textAreaStyle: {minHeight: '25em'},
            value: this.props.code,
            mode: 'javascript',
            onChange: this.updateLocalCode
        });
    }
};

module.exports = React.createClass(CodeEditor);
