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

var _ONE_DAY = 86400;
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

function roundingFunction(seconds, settings) {
    if (seconds === null) {
        return null;
    } else if (typeof settings.step !== "number") {
        // TODO: nearest fit irregular steps
        return seconds;
    } else {
        var offset = seconds % (settings.step * 60); // step is in minutes

        if (offset >= settings.step * 30) {
            // if offset is larger than a half step, round up
            seconds += settings.step * 60 - offset;
        } else {
            // round down
            seconds -= offset;
        }

        return seconds % _ONE_DAY;
    }
}

function _hideKeyboard(self) {
    var settings = globalSettings;
    return window.navigator.msMaxTouchPoints || 'ontouchstart' in document;
}

var TimePicker = function (_React$Component) {
    (0, _inherits3.default)(TimePicker, _React$Component);

    function TimePicker(props) {
        (0, _classCallCheck3.default)(this, TimePicker);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TimePicker.__proto__ || (0, _getPrototypeOf2.default)(TimePicker)).call(this, props));

        var settings = (0, _assign2.default)({}, defaults, props);

        if (settings.lang) {
            (0, _assign2.default)(_Lang2.default, settings.lang);
        }

        globalSettings = (0, _Settings._parseSettings)(settings);

        _this.state = {
            value: props.value,
            open: props.open,
            timeOptions: _this.prepareTimeOptions()
        };

        if (!globalSettings.useSelect) {
            //this._formatValue();
        }

        _this._keydownhandler = _this._keydownhandler.bind(_this);
        _this._keyuphandler = _this._keyuphandler.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(TimePicker, [{
        key: 'prepareTimeOptions',
        value: function prepareTimeOptions() {
            var settings = globalSettings;

            var start = settings.minTime !== null ? settings.minTime : 0;
            var end = settings.maxTime !== null ? settings.maxTime : start + _ONE_DAY - 1;

            if (end < start) {
                // make sure the end time is greater than start time, otherwise there will be no list to show
                end += _ONE_DAY;
            }

            var stepFunc = settings.step;
            if (typeof stepFunc != 'function') {
                stepFunc = function stepFunc() {
                    return settings.step;
                };
            }

            var timeOptions = [];

            for (var i = start, j = 0; i <= end; j++, i += stepFunc(j) * 60) {
                var timeInt = i;
                var timeString = _TimeParser2.default._int2time(timeInt, settings);
                timeOptions[j] = { index: j, timeInt: timeInt, timeString: timeString };
            }

            return timeOptions;
        }
    }, {
        key: '_roundAndFormatTime',
        value: function _roundAndFormatTime(seconds, settings) {
            seconds = roundingFunction(seconds, settings);
            if (seconds !== null) {
                return _TimeParser2.default._int2time(seconds, settings);
            }
        }
    }, {
        key: 'findTimeOption',
        value: function findTimeOption(value) {
            if (!value && value !== 0) {
                return false;
            }

            var settings = globalSettings;
            var out = false;
            var value = roundingFunction(value, settings);

            // loop through the menu items
            this.state.timeOptions.every(function (timeOption, index) {
                if (timeOption.timeInt == value) {
                    out = timeOption;
                    return false;
                }
                return true;
            }, this);

            return out;
        }
    }, {
        key: '_setSelected',
        value: function _setSelected() {

            var timeValue = _TimeParser2.default._time2int(this.state.value, globalSettings);
            if (timeValue === null) {
                return;
            }

            var selected = this.findTimeOption(timeValue);
            if (selected) {

                // var topDelta = selected.offset().top - list.offset().top;

                // if (topDelta + selected.outerHeight() > list.outerHeight() || topDelta < 0) {
                //     list.scrollTop(list.scrollTop() + selected.position().top - selected.outerHeight());
                // }

                // selected.addClass('ui-timepicker-selected');
                this.setState({ selectedIndex: selected.index });
            }
        }
    }, {
        key: '_formatValue',
        value: function _formatValue() {
            if (this.state.value === '') {
                return;
            }

            var settings = globalSettings;
            var seconds = _TimeParser2.default._time2int(this.state.value, settings);

            if (seconds === null) {
                if (this.props.timeFormatError) this.props.timeFormatError();
                return;
            }

            var rangeError = false;
            // check that the time in within bounds
            if (settings.minTime !== null && settings.maxTime !== null && (seconds < settings.minTime || seconds > settings.maxTime)) {
                rangeError = true;
            }

            var prettyTime = _TimeParser2.default._int2time(seconds, settings);
            if (rangeError) {
                if (this._setTimeValue(prettyTime)) {
                    if (this.props.timeRangeError) this.props.timeRangeError();
                }
            } else {
                this._setTimeValue(prettyTime);
            }
        }
    }, {
        key: '_setTimeValue',
        value: function _setTimeValue(prettyTime) {
            if (this.props.onSelect) this.props.onSelect(prettyTime);
        }
    }, {
        key: '_getSelectedIndexValue',
        value: function _getSelectedIndexValue() {
            if (typeof this.state.selectedIndex === "undefined") return;

            return this.state.timeOptions[this.state.selectedIndex].timeString;
        }
    }, {
        key: '_setSelectedIndexValue',
        value: function _setSelectedIndexValue() {
            var prettyTime = this._getSelectedIndexValue();
            this._setTimeValue(prettyTime);
        }

        /*
        *  Keyboard navigation via arrow keys
        */

    }, {
        key: '_keydownhandler',
        value: function _keydownhandler(e) {

            switch (e.keyCode) {

                case 13:
                    // return
                    this._setSelectedIndexValue();

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
        key: '_keyuphandler',
        value: function _keyuphandler(e) {
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
                        this._setSelected();
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
            // if (this.container)
            //     this.container.focus();

            this._setSelected();

            window.addEventListener("keydown", this._keydownhandler);
            window.addEventListener("keyup", this._keyuphandler);
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            // if (this.container)
            //     this.container.focus();
            //this._setSelected();
            this.scrollToIndex();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.removeEventListener("keydown", this._keydownhandler);
            window.removeEventListener("keyup", this._keyuphandler);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            // if (this.state.open && !nextProps.open) {
            //     //handle before close
            // }
            var timeValue = _TimeParser2.default._time2int(nextProps.value, globalSettings);
            var selectedTimeOption = this.findTimeOption(timeValue);
            var selectedIndex = selectedTimeOption ? selectedTimeOption.index : 0;
            this.setState({ value: nextProps.value, open: nextProps.open, selectedIndex: selectedIndex });
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

            this.setState({ selectedIndex: index }, function () {
                _this2._setTimeValue(prettyTime);
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