function _parseSettings(settings) {
    if (typeof settings.step === "string" && !isNaN(settings.step)) {
        settings.step = parseInt(settings.step);
    }

    if (settings.minTime) {
        settings.minTime = _time2int(settings.minTime);
    }

    if (settings.maxTime) {
        settings.maxTime = _time2int(settings.maxTime);
    }

    if (settings.minTime) {
        settings.scrollDefault = function () {
            return roundingFunction(settings.minTime, settings);
        }
    }

    if (typeof (settings.timeFormat) === "string" && settings.timeFormat.match(/[gh]/)) {
        settings._twelveHourTime = true;
    }

    return settings;
}

export {_parseSettings}