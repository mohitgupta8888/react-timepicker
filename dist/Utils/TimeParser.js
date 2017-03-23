'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _Lang = require('../Lang');

var _Lang2 = _interopRequireDefault(_Lang);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _int2time(timeInt, settings) {
    if (typeof timeInt != 'number') {
        return null;
    }

    var seconds = parseInt(timeInt % 60),
        minutes = parseInt(timeInt / 60 % 60),
        hours = parseInt(timeInt / (60 * 60) % 24);

    var time = new Date(1970, 0, 2, hours, minutes, seconds, 0);

    if (isNaN(time.getTime())) {
        return null;
    }

    if (typeof settings.timeFormat === "function") {
        return settings.timeFormat(time);
    }

    var output = '';
    var hour, code;
    for (var i = 0; i < settings.timeFormat.length; i++) {

        code = settings.timeFormat.charAt(i);
        switch (code) {

            case 'a':
                output += time.getHours() > 11 ? _Lang2.default.pm : _Lang2.default.am;
                break;

            case 'A':
                output += time.getHours() > 11 ? _Lang2.default.PM : _Lang2.default.AM;
                break;

            case 'g':
                hour = time.getHours() % 12;
                output += hour === 0 ? '12' : hour;
                break;

            case 'G':
                hour = time.getHours();
                if (timeInt === _ONE_DAY) hour = 0;
                output += hour;
                break;

            case 'h':
                hour = time.getHours() % 12;

                if (hour !== 0 && hour < 10) {
                    hour = '0' + hour;
                }

                output += hour === 0 ? '12' : hour;
                break;

            case 'H':
                hour = time.getHours();
                if (timeInt === _ONE_DAY) hour = 0;
                output += hour > 9 ? hour : '0' + hour;
                break;

            case 'i':
                var minutes = time.getMinutes();
                output += minutes > 9 ? minutes : '0' + minutes;
                break;

            case 's':
                seconds = time.getSeconds();
                output += seconds > 9 ? seconds : '0' + seconds;
                break;

            case '\\':
                // escape character; add the next character and skip ahead
                i++;
                output += settings.timeFormat.charAt(i);
                break;

            default:
                output += code;
        }
    }

    return output;
}

function _time2int(timeString, settings) {
    if (timeString === '' || timeString === null) return null;
    if ((typeof timeString === 'undefined' ? 'undefined' : (0, _typeof3.default)(timeString)) == 'object') {
        return timeString.getHours() * 3600 + timeString.getMinutes() * 60 + timeString.getSeconds();
    }
    if (typeof timeString != 'string') {
        return timeString;
    }

    timeString = timeString.toLowerCase().replace(/[\s\.]/g, '');

    // if the last character is an "a" or "p", add the "m"
    if (timeString.slice(-1) == 'a' || timeString.slice(-1) == 'p') {
        timeString += 'm';
    }

    var ampmRegex = '(' + _Lang2.default.am.replace('.', '') + '|' + _Lang2.default.pm.replace('.', '') + '|' + _Lang2.default.AM.replace('.', '') + '|' + _Lang2.default.PM.replace('.', '') + ')?';

    // try to parse time input
    var pattern = new RegExp('^' + ampmRegex + '([0-9]?[0-9])\\W?([0-5][0-9])?\\W?([0-5][0-9])?' + ampmRegex + '$');

    var time = timeString.match(pattern);
    if (!time) {
        return null;
    }

    var hour = parseInt(time[2] * 1, 10);
    if (hour > 24) {
        if (settings && settings.wrapHours === false) {
            return null;
        } else {
            hour = hour % 24;
        }
    }

    var ampm = time[1] || time[5];
    var hours = hour;

    if (hour <= 12 && ampm) {
        var isPm = ampm == _Lang2.default.pm || ampm == _Lang2.default.PM;

        if (hour == 12) {
            hours = isPm ? 12 : 0;
        } else {
            hours = hour + (isPm ? 12 : 0);
        }
    }

    var minutes = time[3] * 1 || 0;
    var seconds = time[4] * 1 || 0;
    var timeInt = hours * 3600 + minutes * 60 + seconds;

    // if no am/pm provided, intelligently guess based on the scrollDefault
    if (hour < 12 && !ampm && settings && settings._twelveHourTime && settings.scrollDefault) {
        var delta = timeInt - settings.scrollDefault();
        if (delta < 0 && delta >= _ONE_DAY / -2) {
            timeInt = (timeInt + _ONE_DAY / 2) % _ONE_DAY;
        }
    }

    return timeInt;
}

exports.default = { _int2time: _int2time, _time2int: _time2int };