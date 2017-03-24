import React from 'react'
import onClickOutside from 'react-onclickoutside'
import {parseSettings} from './Utils/Settings'
import TimeParser from './Utils/TimeParser'
import lang from './Lang'

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
}

class TimePicker extends React.Component {
    constructor(props) {
        super(props);
        var settings = Object.assign({}, defaults, props);

        if (settings.lang) {
            Object.assign(lang, settings.lang);
        }

        globalSettings = parseSettings(settings);

        var timeOptions = TimeParser.prepareTimeOptions({ timeFormat: globalSettings.timeFormat, step: globalSettings.step, minTime: globalSettings.minTime, maxTime: globalSettings.maxTime })
        var defaultIndex;
        if (props.value && !globalSettings.useSelect) {
            //this.formatValue();
            defaultIndex = this.getDefaultIndex(timeOptions, props.value);
        }

        this.state = {
            value: props.value,
            timeOptions: timeOptions,
            selectedIndex: defaultIndex
        }

        this.keydownhandler = this.keydownhandler.bind(this);
        this.keyuphandler = this.keyuphandler.bind(this);
    }

    getDefaultIndex(timeOptions, timeString) {
        if (timeString === "") {
            return;
        }

        var settings = globalSettings;
        var seconds = TimeParser.time2int(timeString, settings.wrapHours);
        var selectedOption = this.findTimeOption(timeOptions, seconds);
        if (selectedOption)
            return selectedOption.index;
    }


    findTimeOption(timeOptions, timeInt) {
        if (!timeInt && timeInt !== 0) {
            return false;
        }

        var settings = globalSettings;
        var out = false;
        var timeInt = TimeParser.roundingFunction(timeInt, settings.step);

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

    setSelected() {

        var timeValue = TimeParser.time2int(this.state.value, globalSettings.wrapHours);
        if (timeValue === null) {
            return;
        }

        var selected = this.findTimeOption(this.state.timeOptions, timeValue);
        if (selected) {
            this.setState({ selectedIndex: selected.index });
        }
    }

    formatValue() {
        if (this.state.value === '') {
            return;
        }

        var settings = globalSettings;
        var seconds = TimeParser.time2int(this.state.value, settings.wrapHours);

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

        var prettyTime = TimeParser.int2time(seconds, settings.timeFormat);
        if (rangeError) {
            if (this.setTimeValue(prettyTime)) {
                if (this.props.timeRangeError)
                    this.props.timeRangeError();
            }
        } else {
            this.setTimeValue(prettyTime);
        }
    }

    setTimeValue(prettyTime) {
        if (this.props.onSelect)
            this.props.onSelect(prettyTime);
    }

    getSelectedIndexValue() {
        if (typeof this.state.selectedIndex === "undefined")
            return;

        return ((this.state.timeOptions[this.state.selectedIndex]).timeString);
    }

    setSelectedIndexValue() {
        var prettyTime = this.getSelectedIndexValue();
        this.setState({ value: prettyTime }, () => {
            this.setTimeValue(prettyTime)
        })
    }

    changeSelectedIndex(change) {
        if (!this.state.timeOptions)
            return;

        var optionsLength = this.state.timeOptions.length;
        if (optionsLength == 0)
            return;

        var currentIndex = this.state.selectedIndex;
        var newIndex = currentIndex + change;

        if (change == -1) {
            if (currentIndex <= 0) {
                newIndex = optionsLength - 1;
            }
        } else if (change == 1) {
            if (currentIndex === optionsLength - 1) {
                newIndex = 0;
            }
        }

        this.setState({ selectedIndex: newIndex });
    }

    /*
    *  Keyboard navigation via arrow keys
    */
    keydownhandler(e) {

        switch (e.keyCode) {

            case 13: // return
                this.setSelectedIndexValue();

                e.preventDefault();
                return false;

            case 38: // up
                this.changeSelectedIndex(-1)
                return false;

            case 40: // down
                this.changeSelectedIndex(1)
                return false;

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
    keyuphandler(e) {
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
                    this.setSelected();
                } else {
                    //list.hide();
                }
                break;
        }
    }

    scrollToIndex() {
        if (typeof this.state.selectedIndex !== "number")
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

        //this.setSelected();
        window.addEventListener("keydown", this.keydownhandler);
        window.addEventListener("keyup", this.keyuphandler);

        this.scrollToIndex();
    }

    componentDidUpdate() {
        this.scrollToIndex();
    }

    componentWillUnmount() {
        var timeValue = TimeParser.time2int(this.state.value, globalSettings.wrapHours);
        if (timeValue !== null) {
            var prettyTime = TimeParser.int2time(timeValue, globalSettings.timeFormat);
            this.setTimeValue(prettyTime);
        }

        window.removeEventListener("keydown", this.keydownhandler);
        window.removeEventListener("keyup", this.keyuphandler);
    }

    componentWillReceiveProps(nextProps) {
        // if (nextProps.value == "0524") {
        //     debugger;
        // }
        var timeValue = TimeParser.time2int(nextProps.value, globalSettings.wrapHours);
        var selectedTimeOption = this.findTimeOption(this.state.timeOptions, timeValue);
        var selectedIndex = selectedTimeOption ? selectedTimeOption.index : null;
        this.setState({ value: nextProps.value, selectedIndex: selectedIndex });
    }

    close() {
        if (this.props.onClose)
            this.props.onClose();
    }

    onTimeSelect(prettyTime, index) {
        this.setState({ selectedIndex: index, value: prettyTime }, () => {
            this.setTimeValue(prettyTime)
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