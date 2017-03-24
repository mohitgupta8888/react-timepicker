'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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

var _reactOnclickoutside = require('react-onclickoutside');

var _reactOnclickoutside2 = _interopRequireDefault(_reactOnclickoutside);

var _Settings = require('./Utils/Settings');

var _TimeParser = require('./Utils/TimeParser');

var _TimeParser2 = _interopRequireDefault(_TimeParser);

var _Lang = require('./Lang');

var _Lang2 = _interopRequireDefault(_Lang);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var globalSettings;

var defaults = {
    className: null,
    maxTime: null,
    minTime: null,
    selectOnBlur: false,
    step: 30,
    timeFormat: 'g:ia',
    typeaheadHighlight: true,
    useSelect: false,
    wrapHours: true
};

var TimePicker = function (_React$Component) {
    (0, _inherits3.default)(TimePicker, _React$Component);

    function TimePicker(props) {
        (0, _classCallCheck3.default)(this, TimePicker);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TimePicker.__proto__ || (0, _getPrototypeOf2.default)(TimePicker)).call(this, props));

        var settings = (0, _assign2.default)({}, defaults, props);

        if (settings.lang) {
            (0, _assign2.default)(_Lang2.default, settings.lang);
        }

        globalSettings = (0, _Settings.parseSettings)(settings);

        var timeOptions = _TimeParser2.default.prepareTimeOptions({ timeFormat: globalSettings.timeFormat, step: globalSettings.step, minTime: globalSettings.minTime, maxTime: globalSettings.maxTime });
        if (props.value && !globalSettings.useSelect) {
            //this.formatValue();
            var defaultIndex = _this.getDefaultIndex(timeOptions, props.value);
        }

        _this.state = {
            value: props.value,
            timeOptions: timeOptions
        };

        _this.keydownhandler = _this.keydownhandler.bind(_this);
        _this.keyuphandler = _this.keyuphandler.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(TimePicker, [{
        key: 'getDefaultIndex',
        value: function getDefaultIndex(timeOptions, timeString) {
            if (timeString === "") {
                return;
            }

            var settings = globalSettings;
            var seconds = _TimeParser2.default.time2int(timeString, settings.wrapHours);
            var selectedOption = this.findTimeOption(timeOptions, seconds);
            if (selectedOption) return selectedOption.index;
        }
    }, {
        key: 'findTimeOption',
        value: function findTimeOption(timeOptions, timeInt) {
            if (!timeInt && timeInt !== 0) {
                return false;
            }

            var settings = globalSettings;
            var out = false;
            var timeInt = _TimeParser2.default.roundingFunction(timeInt, settings.step);

            // loop through the menu items
            timeOptions.every(function (timeOption, index) {
                if (timeOption.timeInt == timeInt) {
                    out = timeOption;
                    return false;
                }
                return true;
            }, this);

            return out;
        }
    }, {
        key: 'setSelected',
        value: function setSelected() {

            var timeValue = _TimeParser2.default.time2int(this.state.value, globalSettings.wrapHours);
            if (timeValue === null) {
                return;
            }

            var selected = this.findTimeOption(this.state.timeOptions, timeValue);
            if (selected) {
                this.setState({ selectedIndex: selected.index });
            }
        }
    }, {
        key: 'formatValue',
        value: function formatValue() {
            if (this.state.value === '') {
                return;
            }

            var settings = globalSettings;
            var seconds = _TimeParser2.default.time2int(this.state.value, settings.wrapHours);

            if (seconds === null) {
                if (this.props.timeFormatError) this.props.timeFormatError();
                return;
            }

            var rangeError = false;
            // check that the time in within bounds
            if (settings.minTime !== null && settings.maxTime !== null && (seconds < settings.minTime || seconds > settings.maxTime)) {
                rangeError = true;
            }

            var prettyTime = _TimeParser2.default.int2time(seconds, settings.timeFormat);
            if (rangeError) {
                if (this.setTimeValue(prettyTime)) {
                    if (this.props.timeRangeError) this.props.timeRangeError();
                }
            } else {
                this.setTimeValue(prettyTime);
            }
        }
    }, {
        key: 'setTimeValue',
        value: function setTimeValue(prettyTime) {
            if (this.props.onSelect) this.props.onSelect(prettyTime);
        }
    }, {
        key: 'getSelectedIndexValue',
        value: function getSelectedIndexValue() {
            if (typeof this.state.selectedIndex === "undefined") return;

            return this.state.timeOptions[this.state.selectedIndex].timeString;
        }
    }, {
        key: 'setSelectedIndexValue',
        value: function setSelectedIndexValue() {
            var prettyTime = this.getSelectedIndexValue();
            this.setTimeValue(prettyTime);
        }

        /*
        *  Keyboard navigation via arrow keys
        */

    }, {
        key: 'keydownhandler',
        value: function keydownhandler(e) {

            switch (e.keyCode) {

                case 13:
                    // return
                    this.setSelectedIndexValue();

                    e.preventDefault();
                    return false;

                case 38:
                    // up
                    var newIndex = 0;
                    if (typeof this.state.selectedIndex !== "undefined") newIndex = this.state.selectedIndex - 1;

                    this.setState({ selectedIndex: newIndex });

                    return false;

                case 40:
                    // down
                    var newIndex = 0;
                    if (typeof this.state.selectedIndex !== "undefined") newIndex = this.state.selectedIndex + 1;

                    this.setState({ selectedIndex: newIndex });

                    return true;

                case 9:
                    //tab
                    this.close();
                    break;
                case 27:
                    // escape
                    this.close();
                    break;

                default:
                    return true;
            }
        }

        /*
        *	Time typeahead
        */

    }, {
        key: 'keyuphandler',
        value: function keyuphandler(e) {
            var settings = globalSettings;

            switch (e.keyCode) {

                case 96: // numpad numerals
                case 97:
                case 98:
                case 99:
                case 100:
                case 101:
                case 102:
                case 103:
                case 104:
                case 105:
                case 48: // numerals
                case 49:
                case 50:
                case 51:
                case 52:
                case 53:
                case 54:
                case 55:
                case 56:
                case 57:
                case 65: // a
                case 77: // m
                case 80: // p
                case 186: // colon
                case 8: // backspace
                case 46:
                    // delete
                    if (settings.typeaheadHighlight) {
                        this.setSelected();
                    } else {
                        //list.hide();
                    }
                    break;
            }
        }
    }, {
        key: 'scrollToIndex',
        value: function scrollToIndex() {
            if (!this.state.selectedIndex) return;

            var timeOptions = this.state.timeOptions.length;

            var container = this.container;
            if (!container) return;

            var scrollHeight = container.scrollHeight;
            var scrollRatio = Math.floor(scrollHeight / timeOptions);
            container.scrollTop = this.state.selectedIndex * scrollRatio - Math.floor(container.clientHeight / 2);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {

            //this.setSelected();

            window.addEventListener("keydown", this.keydownhandler);
            window.addEventListener("keyup", this.keyuphandler);
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.scrollToIndex();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var timeValue = _TimeParser2.default.time2int(this.state.value, globalSettings.wrapHours);
            if (timeValue !== null) {
                var prettyTime = _TimeParser2.default.int2time(timeValue, globalSettings.timeFormat);
                this.setTimeValue(prettyTime);
            }

            window.removeEventListener("keydown", this.keydownhandler);
            window.removeEventListener("keyup", this.keyuphandler);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            // if (nextProps.value == "0524") {
            //     debugger;
            // }
            var timeValue = _TimeParser2.default.time2int(nextProps.value, globalSettings.wrapHours);
            var selectedTimeOption = this.findTimeOption(this.state.timeOptions, timeValue);
            var selectedIndex = selectedTimeOption ? selectedTimeOption.index : null;
            this.setState({ value: nextProps.value, selectedIndex: selectedIndex });
        }
    }, {
        key: 'close',
        value: function close() {
            if (this.props.onClose) this.props.onClose();
        }
    }, {
        key: 'onTimeSelect',
        value: function onTimeSelect(prettyTime, index) {
            var _this2 = this;

            this.setState({ selectedIndex: index, value: prettyTime }, function () {
                _this2.setTimeValue(prettyTime);
            });
        }
    }, {
        key: 'getListOptions',
        value: function getListOptions() {
            var settings = globalSettings;

            var listOptions = [];
            this.state.timeOptions.forEach(function (timeOption, index) {
                var timeInt = timeOption.timeInt;
                var timeString = timeOption.timeString;

                if (settings.useSelect) {
                    var row = _react2.default.createElement(
                        'option',
                        { key: index, value: timeString },
                        timeString
                    );
                } else {
                    var rowCssClass = timeInt % 86400 < 43200 ? 'ui-timepicker-am' : 'ui-timepicker-pm';
                    if (this.state.selectedIndex == index) rowCssClass = rowCssClass + " ui-timepicker-selected";
                    var timeIntVal = timeInt <= 86400 ? timeInt : timeInt % 86400;
                    var row = _react2.default.createElement(
                        'li',
                        { key: index, className: rowCssClass, onClick: this.onTimeSelect.bind(this, timeString, index) },
                        timeString
                    );
                }

                listOptions.push(row);
            }, this);

            return listOptions;
        }
    }, {
        key: 'handleClickOutside',
        value: function handleClickOutside(evt) {
            // ..handling code goes here...
            if (this.props.inputRef && evt.target.isSameNode(this.props.inputRef)) return;

            this.close();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            if (!this.state.timeOptions instanceof Array) return null;

            var settings = globalSettings;
            var listOptions = this.getListOptions();

            var reactControl;
            var controlCss = [];
            if (settings.className) controlCss.push(settings.className);

            if (settings.useSelect) {
                controlCss.push("ui-timepicker-select");
                reactControl = _react2.default.createElement(
                    'select',
                    { className: controlCss.join(" ") },
                    listOptions
                );
            } else {
                controlCss.push("ui-timepicker-wrapper");
                reactControl = _react2.default.createElement(
                    'div',
                    { className: controlCss.join(" "), tabIndex: '-1', style: { position: "absolute" }, ref: function ref(container) {
                            return _this3.container = container;
                        } },
                    _react2.default.createElement(
                        'ul',
                        { className: 'ui-timepicker-list' },
                        listOptions
                    )
                );
            }

            return reactControl;
        }
    }]);
    return TimePicker;
}(_react2.default.Component);

exports.default = (0, _reactOnclickoutside2.default)(TimePicker);