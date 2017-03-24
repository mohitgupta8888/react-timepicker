import React from 'react'
import onClickOutside from 'react-onclickoutside'
import {_parseSettings} from './Utils/Settings'
import TimeParser from './Utils/TimeParser'
import _lang from './Lang'

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
}

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
            seconds += (settings.step * 60) - offset;
        } else {
            // round down
            seconds -= offset;
        }

        return seconds % _ONE_DAY;
    }
}

function _hideKeyboard(self) {
    var settings = globalSettings;
    return (window.navigator.msMaxTouchPoints || 'ontouchstart' in document);
}

class TimePicker extends React.Component {
    constructor(props) {
        super(props);
        var settings = Object.assign({}, defaults, props);

        if (settings.lang) {
            Object.assign(_lang, settings.lang);
        }

        globalSettings = _parseSettings(settings);

        this.state = {
            value: props.value,
            open: props.open,
            timeOptions: this.prepareTimeOptions()
        }

        if (!globalSettings.useSelect) {
            //this._formatValue();
        }

        this._keydownhandler = this._keydownhandler.bind(this);
        this._keyuphandler = this._keyuphandler.bind(this);
    }

    prepareTimeOptions() {
        var settings = globalSettings;

        var start = (settings.minTime !== null) ? settings.minTime : 0;
        var end = (settings.maxTime !== null) ? settings.maxTime : (start + _ONE_DAY - 1);

        if (end < start) {
            // make sure the end time is greater than start time, otherwise there will be no list to show
            end += _ONE_DAY;
        }

        var stepFunc = settings.step;
        if (typeof stepFunc != 'function') {
            stepFunc = function () {
                return settings.step;
            }
        }

        var timeOptions = [];

        for (var i = start, j = 0; i <= end; j++ , i += stepFunc(j) * 60) {
            var timeInt = i;
            var timeString = TimeParser._int2time(timeInt, settings);
            timeOptions[j] = { index: j, timeInt: timeInt, timeString: timeString };
        }

        return timeOptions;
    }

    _roundAndFormatTime(seconds, settings) {
        seconds = roundingFunction(seconds, settings);
        if (seconds !== null) {
            return TimeParser._int2time(seconds, settings);
        }
    }

    findTimeOption(value) {
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

    _setSelected() {

        var timeValue = TimeParser._time2int(this.state.value, globalSettings);
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

    _formatValue() {
        if (this.state.value === '') {
            return;
        }

        var settings = globalSettings;
        var seconds = TimeParser._time2int(this.state.value, settings);

        if (seconds === null) {
            if (this.props.timeFormatError)
                this.props.timeFormatError();
            return;
        }

        var rangeError = false;
        // check that the time in within bounds
        if ((settings.minTime !== null && settings.maxTime !== null)
            && (seconds < settings.minTime || seconds > settings.maxTime)) {
            rangeError = true;
        }

        var prettyTime = TimeParser._int2time(seconds, settings);
        if (rangeError) {
            if (this._setTimeValue(prettyTime)) {
                if (this.props.timeRangeError)
                    this.props.timeRangeError();
            }
        } else {
            this._setTimeValue(prettyTime);
        }
    }

    _setTimeValue(prettyTime) {
        if (this.props.onSelect)
            this.props.onSelect(prettyTime);
    }

    _getSelectedIndexValue() {
        if (typeof this.state.selectedIndex === "undefined")
            return;

        return ((this.state.timeOptions[this.state.selectedIndex]).timeString);
    }

    _setSelectedIndexValue() {
        var prettyTime = this._getSelectedIndexValue();
        this._setTimeValue(prettyTime);
    }

    /*
    *  Keyboard navigation via arrow keys
    */
    _keydownhandler(e) {

        switch (e.keyCode) {

            case 13: // return
                this._setSelectedIndexValue();

                e.preventDefault();
                return false;

            case 38: // up
                var newIndex = 0;
                if (typeof this.state.selectedIndex !== "undefined")
                    newIndex = this.state.selectedIndex - 1;

                this.setState({ selectedIndex: newIndex });

                return false;

            case 40: // down
                var newIndex = 0;
                if (typeof this.state.selectedIndex !== "undefined")
                    newIndex = this.state.selectedIndex + 1;

                this.setState({ selectedIndex: newIndex });

                return true;

            case 9: //tab
                this.close();
                break;
            case 27: // escape
                this.close();
                break;

            default:
                return true;
        }
    }

    /*
    *	Time typeahead
    */
    _keyuphandler(e) {
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
            case 46: // delete
                if (settings.typeaheadHighlight) {
                    this._setSelected();
                } else {
                    //list.hide();
                }
                break;
        }
    }

    scrollToIndex() {
        if (!this.state.selectedIndex)
            return;

        var timeOptions = this.state.timeOptions.length;

        var container = this.container;
        if (!container)
            return;

        var scrollHeight = container.scrollHeight;
        var scrollRatio = Math.floor(scrollHeight / timeOptions)
        container.scrollTop = ((this.state.selectedIndex * scrollRatio) - Math.floor(container.clientHeight / 2));
    }

    componentDidMount() {
        // if (this.container)
        //     this.container.focus();

        this._setSelected();

        window.addEventListener("keydown", this._keydownhandler);
        window.addEventListener("keyup", this._keyuphandler);
    }

    componentDidUpdate() {
        // if (this.container)
        //     this.container.focus();
        //this._setSelected();
        this.scrollToIndex();
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this._keydownhandler);
        window.removeEventListener("keyup", this._keyuphandler);
    }

    componentWillReceiveProps(nextProps) {
        // if (this.state.open && !nextProps.open) {
        //     //handle before close
        // }
        var timeValue = TimeParser._time2int(nextProps.value, globalSettings);
        var selectedTimeOption = this.findTimeOption(timeValue);
        var selectedIndex = selectedTimeOption ? selectedTimeOption.index : 0;
        this.setState({ value: nextProps.value, open: nextProps.open, selectedIndex: selectedIndex });
    }

    close() {
        if (this.props.onClose)
            this.props.onClose();
    }

    onTimeSelect(prettyTime, index) {
        this.setState({ selectedIndex: index }, () => {
            this._setTimeValue(prettyTime)
        })
    }

    getListOptions() {
        var settings = globalSettings;

        var listOptions = [];
        this.state.timeOptions.forEach(function (timeOption, index) {
            var timeInt = timeOption.timeInt;
            var timeString = timeOption.timeString;

            if (settings.useSelect) {
                var row = <option key={index} value={timeString}>{timeString}</option>
            } else {
                var rowCssClass = timeInt % 86400 < 43200 ? 'ui-timepicker-am' : 'ui-timepicker-pm';
                if (this.state.selectedIndex == index)
                    rowCssClass = rowCssClass + " ui-timepicker-selected";
                var timeIntVal = (timeInt <= 86400 ? timeInt : timeInt % 86400);
                var row = <li key={index} className={rowCssClass} onClick={this.onTimeSelect.bind(this, timeString, index) }>{timeString}</li>
            }

            listOptions.push(row);
        }, this);

        return listOptions;
    }

    handleClickOutside(evt) {
        // ..handling code goes here...
        if (this.props.inputRef && evt.target.isSameNode(this.props.inputRef))
            return;

        this.close();
    }

    render() {

        if (!this.state.timeOptions instanceof (Array))
            return null;

        var settings = globalSettings;
        var listOptions = this.getListOptions();

        var reactControl;
        var controlCss = [];
        if (settings.className)
            controlCss.push(settings.className);

        if (settings.useSelect) {
            controlCss.push("ui-timepicker-select");
            reactControl = (
                <select className={controlCss.join(" ") }>
                    {listOptions}
                </select>
            );
        } else {
            controlCss.push("ui-timepicker-wrapper");
            reactControl = (
                <div className={controlCss.join(" ") } tabIndex="-1" style={{ position: "absolute" }} ref={(container) => this.container = container}>
                    <ul className="ui-timepicker-list">
                        {listOptions}
                    </ul>
                </div>
            )
        }

        return reactControl;
    }
}

export default onClickOutside(TimePicker)