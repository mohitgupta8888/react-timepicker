import lang from '../Lang'

var _ONE_DAY = 86400;

function int2time(timeInt, timeFormat) {
    if (typeof timeInt != 'number') {
        return null;
    }

    var seconds = parseInt(timeInt % 60)
        , minutes = parseInt((timeInt / 60) % 60)
        , hours = parseInt((timeInt / (60 * 60)) % 24);

    var time = new Date(1970, 0, 2, hours, minutes, seconds, 0);

    if (isNaN(time.getTime())) {
        return null;
    }

    if (typeof (timeFormat) === "function") {
        return timeFormat(time);
    }

    var output = '';
    var hour, code;
    for (var i = 0; i < timeFormat.length; i++) {

        code = timeFormat.charAt(i);
        switch (code) {

            case 'a':
                output += (time.getHours() > 11) ? lang.pm : lang.am;
                break;

            case 'A':
                output += (time.getHours() > 11) ? lang.PM : lang.AM;
                break;

            case 'g':
                hour = time.getHours() % 12;
                output += (hour === 0) ? '12' : hour;
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

                output += (hour === 0) ? '12' : hour;
                break;

            case 'H':
                hour = time.getHours();
                if (timeInt === _ONE_DAY) hour = 0;
                output += (hour > 9) ? hour : '0' + hour;
                break;

            case 'i':
                var minutes = time.getMinutes();
                output += (minutes > 9) ? minutes : '0' + minutes;
                break;

            case 's':
                seconds = time.getSeconds();
                output += (seconds > 9) ? seconds : '0' + seconds;
                break;

            case '\\':
                // escape character; add the next character and skip ahead
                i++;
                output += timeFormat.charAt(i);
                break;

            default:
                output += code;
        }
    }

    return output;
}

function time2int(timeString, wrapHours) {
    if (timeString === '' || timeString === null) return null;
    if (typeof timeString == 'object') {
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

    var ampmRegex = '(' +
        lang.am.replace('.', '') + '|' +
        lang.pm.replace('.', '') + '|' +
        lang.AM.replace('.', '') + '|' +
        lang.PM.replace('.', '') + ')?';

    // try to parse time input
    var pattern = new RegExp('^' + ampmRegex + '([0-9]?[0-9])\\W?([0-5][0-9])?\\W?([0-5][0-9])?' + ampmRegex + '$');

    var time = timeString.match(pattern);
    if (!time) {
        return null;
    }

    var hour = parseInt(time[2] * 1, 10);
    if (hour > 24) {
        if (wrapHours === false) {
            return null;
        } else {
            hour = hour % 24;
        }
    }

    var ampm = time[1] || time[5];
    var hours = hour;

    if (hour <= 12 && ampm) {
        var isPm = (ampm == lang.pm || ampm == lang.PM);

        if (hour == 12) {
            hours = isPm ? 12 : 0;
        } else {
            hours = (hour + (isPm ? 12 : 0));
        }
    }

    var minutes = (time[3] * 1 || 0);
    var seconds = (time[4] * 1 || 0);
    var timeInt = hours * 3600 + minutes * 60 + seconds;

    return timeInt;
}

function roundingFunction(seconds, step) {
    if (seconds === null) {
        return null;
    } else if (typeof step !== "number") {
        // TODO: nearest fit irregular steps
        return seconds;
    } else {
        var offset = seconds % (step * 60); // step is in minutes

        if (offset >= step * 30) {
            // if offset is larger than a half step, round up
            seconds += (step * 60) - offset;
        } else {
            // round down
            seconds -= offset;
        }

        return seconds % _ONE_DAY;
    }
}

function prepareTimeOptions(settings) {

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
            var timeString = int2time(timeInt, settings.timeFormat);
            timeOptions[j] = { index: j, timeInt: timeInt, timeString: timeString };
        }

        return timeOptions;
    }


export default {int2time, time2int, roundingFunction, prepareTimeOptions}