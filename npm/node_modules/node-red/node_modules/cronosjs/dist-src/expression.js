import { _parse } from './parser';
import { CronosDate, CronosTimezone } from './date';
import { flatMap } from './utils';
const hourinms = 60 * 60 * 1000;
const findFirstFrom = (from, list) => list.findIndex(n => n >= from);
export class CronosExpression {
    constructor(cronString, seconds, minutes, hours, days, months, years) {
        this.cronString = cronString;
        this.seconds = seconds;
        this.minutes = minutes;
        this.hours = hours;
        this.days = days;
        this.months = months;
        this.years = years;
        this.skipRepeatedHour = true;
        this.missingHour = 'insert';
        this._warnings = null;
    }
    static parse(cronstring, options = {}) {
        var _a;
        const parsedFields = _parse(cronstring);
        if (options.strict) {
            let warnings = flatMap(parsedFields, field => field.warnings);
            if (typeof options.strict === 'object') {
                warnings = warnings
                    .filter(warning => !!options.strict[warning.type]);
            }
            if (warnings.length > 0) {
                throw new Error(`Strict mode: Parsing failed with ${warnings.length} warnings`);
            }
        }
        const expr = new CronosExpression(cronstring, parsedFields[0].values, parsedFields[1].values, parsedFields[2].values, parsedFields[3].values, parsedFields[4].values, parsedFields[5]);
        expr.timezone = options.timezone instanceof CronosTimezone ? options.timezone :
            (options.timezone !== undefined ? new CronosTimezone(options.timezone) : undefined);
        expr.skipRepeatedHour = options.skipRepeatedHour !== undefined ? options.skipRepeatedHour : expr.skipRepeatedHour;
        expr.missingHour = (_a = options.missingHour) !== null && _a !== void 0 ? _a : expr.missingHour;
        return expr;
    }
    get warnings() {
        if (!this._warnings) {
            const parsedFields = _parse(this.cronString);
            this._warnings = flatMap(parsedFields, field => field.warnings);
        }
        return this._warnings;
    }
    toString() {
        var _a, _b;
        const showTzOpts = !this.timezone || !!this.timezone.zoneName;
        const timezone = Object.entries({
            tz: (_b = (_a = this.timezone) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : 'Local',
            skipRepeatedHour: showTzOpts && this.skipRepeatedHour.toString(),
            missingHour: showTzOpts && this.missingHour,
        }).map(([key, val]) => val && key + ': ' + val).filter(s => s).join(', ');
        return `${this.cronString} (${timezone})`;
    }
    nextDate(afterDate = new Date()) {
        var _a;
        const fromCronosDate = CronosDate.fromDate(afterDate, this.timezone);
        if (((_a = this.timezone) === null || _a === void 0 ? void 0 : _a.fixedOffset) !== undefined) {
            return this._next(fromCronosDate).date;
        }
        const fromTimestamp = afterDate.getTime(), fromLocalTimestamp = fromCronosDate['toUTCTimestamp'](), prevHourLocalTimestamp = CronosDate.fromDate(new Date(fromTimestamp - hourinms), this.timezone)['toUTCTimestamp'](), nextHourLocalTimestamp = CronosDate.fromDate(new Date(fromTimestamp + hourinms), this.timezone)['toUTCTimestamp'](), nextHourRepeated = nextHourLocalTimestamp - fromLocalTimestamp === 0, thisHourRepeated = fromLocalTimestamp - prevHourLocalTimestamp === 0, thisHourMissing = fromLocalTimestamp - prevHourLocalTimestamp === hourinms * 2;
        if (this.skipRepeatedHour && thisHourRepeated) {
            return this._next(fromCronosDate.copyWith({ minute: 59, second: 60 }), false).date;
        }
        if (this.missingHour === 'offset' && thisHourMissing) {
            const nextDate = this._next(fromCronosDate.copyWith({ hour: fromCronosDate.hour - 1 })).date;
            if (!nextDate || nextDate.getTime() > fromTimestamp)
                return nextDate;
        }
        let { date: nextDate, cronosDate: nextCronosDate } = this._next(fromCronosDate);
        if (this.missingHour !== 'offset' && nextCronosDate && nextDate) {
            const nextDateNextHourTimestamp = nextCronosDate.copyWith({ hour: nextCronosDate.hour + 1 }).toDate(this.timezone).getTime();
            if (nextDateNextHourTimestamp === nextDate.getTime()) {
                if (this.missingHour === 'insert') {
                    return nextCronosDate.copyWith({ minute: 0, second: 0 }).toDate(this.timezone);
                }
                // this.missingHour === 'skip'
                return this._next(nextCronosDate.copyWith({ minute: 59, second: 59 })).date;
            }
        }
        if (!this.skipRepeatedHour) {
            if (nextHourRepeated && (!nextDate || (nextDate.getTime() > fromTimestamp + hourinms))) {
                nextDate = this._next(fromCronosDate.copyWith({ minute: 0, second: 0 }), false).date;
            }
            if (nextDate && nextDate < afterDate) {
                nextDate = new Date(nextDate.getTime() + hourinms);
            }
        }
        return nextDate;
    }
    _next(date, after = true) {
        const nextDate = this._nextYear(after ? date.copyWith({ second: date.second + 1 }) : date);
        return {
            cronosDate: nextDate,
            date: nextDate ? nextDate.toDate(this.timezone) : null
        };
    }
    nextNDates(afterDate = new Date(), n = 5) {
        const dates = [];
        let lastDate = afterDate;
        for (let i = 0; i < n; i++) {
            const date = this.nextDate(lastDate);
            if (!date)
                break;
            lastDate = date;
            dates.push(date);
        }
        return dates;
    }
    _nextYear(fromDate) {
        let year = fromDate.year;
        let nextDate = null;
        while (!nextDate) {
            year = this.years.nextYear(year);
            if (year === null)
                return null;
            nextDate = this._nextMonth((year === fromDate.year) ? fromDate : new CronosDate(year));
            year++;
        }
        return nextDate;
    }
    _nextMonth(fromDate) {
        let nextMonthIndex = findFirstFrom(fromDate.month, this.months);
        let nextDate = null;
        while (!nextDate) {
            const nextMonth = this.months[nextMonthIndex];
            if (nextMonth === undefined)
                return null;
            nextDate = this._nextDay((nextMonth === fromDate.month) ? fromDate : new CronosDate(fromDate.year, nextMonth));
            nextMonthIndex++;
        }
        return nextDate;
    }
    _nextDay(fromDate) {
        const days = this.days.getDays(fromDate.year, fromDate.month);
        let nextDayIndex = findFirstFrom(fromDate.day, days);
        let nextDate = null;
        while (!nextDate) {
            const nextDay = days[nextDayIndex];
            if (nextDay === undefined)
                return null;
            nextDate = this._nextHour((nextDay === fromDate.day) ? fromDate : new CronosDate(fromDate.year, fromDate.month, nextDay));
            nextDayIndex++;
        }
        return nextDate;
    }
    _nextHour(fromDate) {
        let nextHourIndex = findFirstFrom(fromDate.hour, this.hours);
        let nextDate = null;
        while (!nextDate) {
            const nextHour = this.hours[nextHourIndex];
            if (nextHour === undefined)
                return null;
            nextDate = this._nextMinute((nextHour === fromDate.hour) ? fromDate :
                new CronosDate(fromDate.year, fromDate.month, fromDate.day, nextHour));
            nextHourIndex++;
        }
        return nextDate;
    }
    _nextMinute(fromDate) {
        let nextMinuteIndex = findFirstFrom(fromDate.minute, this.minutes);
        let nextDate = null;
        while (!nextDate) {
            const nextMinute = this.minutes[nextMinuteIndex];
            if (nextMinute === undefined)
                return null;
            nextDate = this._nextSecond((nextMinute === fromDate.minute) ? fromDate :
                new CronosDate(fromDate.year, fromDate.month, fromDate.day, fromDate.hour, nextMinute));
            nextMinuteIndex++;
        }
        return nextDate;
    }
    _nextSecond(fromDate) {
        const nextSecondIndex = findFirstFrom(fromDate.second, this.seconds), nextSecond = this.seconds[nextSecondIndex];
        if (nextSecond === undefined)
            return null;
        return fromDate.copyWith({ second: nextSecond });
    }
}
