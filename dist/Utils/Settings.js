"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
function _parseSettings(settings) {
    if (settings.minTime) {
        settings.minTime = _time2int(settings.minTime);
    }

    if (settings.maxTime) {
        settings.maxTime = _time2int(settings.maxTime);
    }

    if (settings.minTime) {
        settings.scrollDefault = function () {
            return roundingFunction(settings.minTime, settings);
        };
    }

    if (typeof settings.timeFormat === "string" && settings.timeFormat.match(/[gh]/)) {
        settings._twelveHourTime = true;
    }

    return settings;
}

exports._parseSettings = _parseSettings;