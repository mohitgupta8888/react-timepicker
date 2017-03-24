'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _TimePicker = require('./TimePicker');

var _TimePicker2 = _interopRequireDefault(_TimePicker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TimePickerInput = function (_React$Component) {
    (0, _inherits3.default)(TimePickerInput, _React$Component);

    function TimePickerInput(props) {
        (0, _classCallCheck3.default)(this, TimePickerInput);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TimePickerInput.__proto__ || (0, _getPrototypeOf2.default)(TimePickerInput)).call(this, props));

        _this.state = {
            value: props.value,
            open: false
        };

        _this.inputChange = _this.inputChange.bind(_this);
        _this.inputFocus = _this.inputFocus.bind(_this);
        _this.inputBlur = _this.inputBlur.bind(_this);
        _this.keyDownHandler = _this.keyDownHandler.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(TimePickerInput, [{
        key: 'inputChange',
        value: function inputChange(e) {
            this.setState({ value: e.target.value });
        }
    }, {
        key: 'inputFocus',
        value: function inputFocus() {
            this.setState({ open: true });
        }
    }, {
        key: 'inputBlur',
        value: function inputBlur() {
            //this.setState({ open: false });
        }
    }, {
        key: 'keyDownHandler',
        value: function keyDownHandler(e) {
            if (this.state.open) return;

            if (e.keyCode == 40) {
                // show the list!
                this.setState({ open: true });
            }
        }
    }, {
        key: 'onTimeSelect',
        value: function onTimeSelect(timeString) {
            if (timeString) this.setState({ value: timeString, open: false });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var timePicker;
            if (this.state.open) timePicker = _react2.default.createElement(_TimePicker2.default, {
                timeFormat: "h:i a",
                step: '5',
                value: this.state.value,
                onSelect: this.onTimeSelect.bind(this),
                onClose: function onClose() {
                    _this2.setState({ open: false });
                },
                inputRef: this.inputRef });
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement('input', {
                    type: 'text',
                    value: this.state.value,
                    onChange: this.inputChange,
                    onFocus: this.inputFocus,
                    onBlur: this.inputBlur,
                    onKeyDown: this.keyDownHandler,
                    ref: function ref(input) {
                        return _this2.inputRef = input;
                    } }),
                timePicker
            );
        }
    }]);
    return TimePickerInput;
}(_react2.default.Component);

exports.default = TimePickerInput;