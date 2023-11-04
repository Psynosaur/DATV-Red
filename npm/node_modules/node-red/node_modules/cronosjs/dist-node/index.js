'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const sortAsc = (a, b) => a - b;
function flatMap(arr, mapper) {
  return arr.reduce((acc, val, i) => {
    acc.push(...mapper(val, i, arr));
    return acc;
  }, []);
}

const predefinedCronStrings = {
  '@yearly': '0 0 0 1 1 * *',
  '@annually': '0 0 0 1 1 * *',
  '@monthly': '0 0 0 1 * * *',
  '@weekly': '0 0 0 * * 0 *',
  '@daily': '0 0 0 * * * *',
  '@midnight': '0 0 0 * * * *',
  '@hourly': '0 0 * * * * *'
};
const monthReplacements = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const monthReplacementRegex = new RegExp(monthReplacements.join('|'), 'g');
const dayOfWeekReplacements = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const dayOfWeekReplacementRegex = new RegExp(dayOfWeekReplacements.join('|'), 'g');
/*
"The actual range of times supported by ECMAScript Date objects is slightly smaller:
  exactly –100,000,000 days to 100,000,000 days measured relative to midnight at the
  beginning of 01 January, 1970 UTC. This gives a range of 8,640,000,000,000,000
  milliseconds to either side of 01 January, 1970 UTC."
http://ecma-international.org/ecma-262/5.1/#sec-15.9.1.1

new Date(8640000000000000) => 00:00:00 13th Sep 275760
Largest full year valid as JS date = 275759
*/

const maxValidYear = 275759;
var WarningType;

(function (WarningType) {
  WarningType["IncrementLargerThanRange"] = "IncrementLargerThanRange";
})(WarningType || (WarningType = {}));

function _parse(cronstring) {
  let expr = cronstring.trim().toLowerCase();

  if (predefinedCronStrings[expr]) {
    expr = predefinedCronStrings[expr];
  }

  const fields = expr.split(/\s+/g);

  if (fields.length < 5 || fields.length > 7) {
    throw new Error('Expression must have at least 5 fields, and no more than 7 fields');
  }

  switch (fields.length) {
    case 5:
      fields.unshift('0');

    case 6:
      fields.push('*');
  }

  return [new SecondsOrMinutesField(fields[0]), new SecondsOrMinutesField(fields[1]), new HoursField(fields[2]), new DaysField(fields[3], fields[5]), new MonthsField(fields[4]), new YearsField(fields[6])];
}

function getIncrementLargerThanRangeWarnings(items, first, last) {
  const warnings = [];

  for (let item of items) {
    let rangeLength;

    if (item.step > 1 && item.step > (rangeLength = item.rangeLength(first, last))) {
      warnings.push({
        type: WarningType.IncrementLargerThanRange,
        message: `Increment (${item.step}) is larger than range (${rangeLength}) for expression '${item.itemString}'`
      });
    }
  }

  return warnings;
}

class Field {
  constructor(field) {
    this.field = field;
  }

  parse() {
    return this.field.split(',').map(item => FieldItem.parse(item, this.first, this.last, true));
  }

  get items() {
    if (!this._items) this._items = this.parse();
    return this._items;
  }

  get values() {
    return Field.getValues(this.items, this.first, this.last);
  }

  get warnings() {
    return getIncrementLargerThanRangeWarnings(this.items, this.first, this.last);
  }

  static getValues(items, first, last) {
    return Array.from(new Set(flatMap(items, item => item.values(first, last)))).sort(sortAsc);
  }

}

class FieldItem {
  constructor(itemString) {
    this.itemString = itemString;
    this.step = 1;
  }

  rangeLength(first, last) {
    var _a, _b, _c, _d;

    const start = (_b = (_a = this.range) === null || _a === void 0 ? void 0 : _a.from) !== null && _b !== void 0 ? _b : first,
          end = (_d = (_c = this.range) === null || _c === void 0 ? void 0 : _c.to) !== null && _d !== void 0 ? _d : last;
    return end < start ? last - start + (end - first) + 1 : end - start;
  }

  values(first, last) {
    const start = this.range ? this.range.from : first,
          rangeLength = this.rangeLength(first, last);
    return Array(Math.floor(rangeLength / this.step) + 1).fill(0).map((_, i) => first + (start - first + this.step * i) % (last - first + 1));
  }

  get any() {
    return this.range === undefined && this.step === 1;
  }

  get single() {
    return !!this.range && this.range.from === this.range.to;
  }

  static parse(item, first, last, allowCyclicRange = false, transformer) {
    var _a;

    const fieldItem = new FieldItem(item);
    const [match, all, startFrom, range, step] = (_a = item.match(/^(?:(\*)|([0-9]+)|([0-9]+-[0-9]+))(?:\/([1-9][0-9]*))?$/)) !== null && _a !== void 0 ? _a : [];
    if (!match) throw new Error('Field item invalid format');

    if (step) {
      fieldItem.step = parseInt(step, 10);
    }

    if (startFrom) {
      let start = parseInt(startFrom, 10);
      start = transformer ? transformer(start) : start;
      if (start < first || start > last) throw new Error('Field item out of valid value range');
      fieldItem.range = {
        from: start,
        to: step ? undefined : start
      };
    } else if (range) {
      const [rangeStart, rangeEnd] = range.split('-').map(x => {
        const n = parseInt(x, 10);
        return transformer ? transformer(n) : n;
      });

      if (rangeStart < first || rangeStart > last || rangeEnd < first || rangeEnd > last || rangeEnd < rangeStart && !allowCyclicRange) {
        throw new Error('Field item range invalid, either value out of valid range or start greater than end in non wraparound field');
      }

      fieldItem.range = {
        from: rangeStart,
        to: rangeEnd
      };
    }

    return fieldItem;
  }

}

FieldItem.asterisk = new FieldItem('*');
class SecondsOrMinutesField extends Field {
  constructor() {
    super(...arguments);
    this.first = 0;
    this.last = 59;
  }

}
class HoursField extends Field {
  constructor() {
    super(...arguments);
    this.first = 0;
    this.last = 23;
  }

}
class DaysField {
  constructor(daysOfMonthField, daysOfWeekField) {
    this.lastDay = false;
    this.lastWeekday = false;
    this.daysItems = [];
    this.nearestWeekdayItems = [];
    this.daysOfWeekItems = [];
    this.lastDaysOfWeekItems = [];
    this.nthDaysOfWeekItems = [];

    for (let item of daysOfMonthField.split(',').map(s => s === '?' ? '*' : s)) {
      if (item === 'l') {
        this.lastDay = true;
      } else if (item === 'lw') {
        this.lastWeekday = true;
      } else if (item.endsWith('w')) {
        this.nearestWeekdayItems.push(FieldItem.parse(item.slice(0, -1), 1, 31));
      } else {
        this.daysItems.push(FieldItem.parse(item, 1, 31));
      }
    }

    const normalisedDaysOfWeekField = daysOfWeekField.replace(dayOfWeekReplacementRegex, match => dayOfWeekReplacements.indexOf(match) + '');

    const parseDayOfWeek = item => FieldItem.parse(item, 0, 6, true, n => n === 7 ? 0 : n);

    for (let item of normalisedDaysOfWeekField.split(',').map(s => s === '?' ? '*' : s)) {
      const nthIndex = item.lastIndexOf('#');

      if (item.endsWith('l')) {
        this.lastDaysOfWeekItems.push(parseDayOfWeek(item.slice(0, -1)));
      } else if (nthIndex !== -1) {
        const nth = item.slice(nthIndex + 1);
        if (!/^[1-5]$/.test(nth)) throw new Error('Field item nth of month (#) invalid');
        this.nthDaysOfWeekItems.push({
          item: parseDayOfWeek(item.slice(0, nthIndex)),
          nth: parseInt(nth, 10)
        });
      } else {
        this.daysOfWeekItems.push(parseDayOfWeek(item));
      }
    }
  }

  get values() {
    return DaysFieldValues.fromField(this);
  }

  get warnings() {
    const warnings = [],
          dayItems = [...this.daysItems, ...this.nearestWeekdayItems],
          weekItems = [...this.daysOfWeekItems, ...this.lastDaysOfWeekItems, ...this.nthDaysOfWeekItems.map(({
      item
    }) => item)];
    warnings.push(...getIncrementLargerThanRangeWarnings(dayItems, 1, 31), ...getIncrementLargerThanRangeWarnings(weekItems, 0, 6));
    return warnings;
  }

  get allDays() {
    return !this.lastDay && !this.lastWeekday && !this.nearestWeekdayItems.length && !this.lastDaysOfWeekItems.length && !this.nthDaysOfWeekItems.length && this.daysItems.length === 1 && this.daysItems[0].any && this.daysOfWeekItems.length === 1 && this.daysOfWeekItems[0].any;
  }

}
class DaysFieldValues {
  constructor() {
    this.lastDay = false;
    this.lastWeekday = false;
    this.days = [];
    this.nearestWeekday = [];
    this.daysOfWeek = [];
    this.lastDaysOfWeek = [];
    this.nthDaysOfWeek = [];
  }

  static fromField(field) {
    const values = new DaysFieldValues();

    const filterAnyItems = items => items.filter(item => !item.any);

    values.lastDay = field.lastDay;
    values.lastWeekday = field.lastWeekday;
    values.days = Field.getValues(field.allDays ? [FieldItem.asterisk] : filterAnyItems(field.daysItems), 1, 31);
    values.nearestWeekday = Field.getValues(field.nearestWeekdayItems, 1, 31);
    values.daysOfWeek = Field.getValues(filterAnyItems(field.daysOfWeekItems), 0, 6);
    values.lastDaysOfWeek = Field.getValues(field.lastDaysOfWeekItems, 0, 6);
    const nthDaysHashes = new Set();

    for (let item of field.nthDaysOfWeekItems) {
      for (let n of item.item.values(0, 6)) {
        let hash = n * 10 + item.nth;

        if (!nthDaysHashes.has(hash)) {
          nthDaysHashes.add(hash);
          values.nthDaysOfWeek.push([n, item.nth]);
        }
      }
    }

    return values;
  }

  getDays(year, month) {
    const days = new Set(this.days);
    const lastDateOfMonth = new Date(year, month, 0).getDate();
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

    const getNearestWeekday = day => {
      if (day > lastDateOfMonth) day = lastDateOfMonth;
      const dayOfWeek = (day + firstDayOfWeek - 1) % 7;
      let weekday = day + (dayOfWeek === 0 ? 1 : dayOfWeek === 6 ? -1 : 0);
      return weekday + (weekday < 1 ? 3 : weekday > lastDateOfMonth ? -3 : 0);
    };

    if (this.lastDay) {
      days.add(lastDateOfMonth);
    }

    if (this.lastWeekday) {
      days.add(getNearestWeekday(lastDateOfMonth));
    }

    for (const day of this.nearestWeekday) {
      days.add(getNearestWeekday(day));
    }

    if (this.daysOfWeek.length || this.lastDaysOfWeek.length || this.nthDaysOfWeek.length) {
      const daysOfWeek = Array(7).fill(0).map(() => []);

      for (let day = 1; day < 36; day++) {
        daysOfWeek[(day + firstDayOfWeek - 1) % 7].push(day);
      }

      for (const dayOfWeek of this.daysOfWeek) {
        for (const day of daysOfWeek[dayOfWeek]) {
          days.add(day);
        }
      }

      for (const dayOfWeek of this.lastDaysOfWeek) {
        for (let i = daysOfWeek[dayOfWeek].length - 1; i >= 0; i--) {
          if (daysOfWeek[dayOfWeek][i] <= lastDateOfMonth) {
            days.add(daysOfWeek[dayOfWeek][i]);
            break;
          }
        }
      }

      for (const [dayOfWeek, nthOfMonth] of this.nthDaysOfWeek) {
        days.add(daysOfWeek[dayOfWeek][nthOfMonth - 1]);
      }
    }

    return Array.from(days).filter(day => day <= lastDateOfMonth).sort(sortAsc);
  }

}
class MonthsField extends Field {
  constructor(field) {
    super(field.replace(monthReplacementRegex, match => {
      return monthReplacements.indexOf(match) + 1 + '';
    }));
    this.first = 1;
    this.last = 12;
  }

}
class YearsField extends Field {
  constructor(field) {
    super(field);
    this.first = 1970;
    this.last = 2099;
    this.items;
  }

  parse() {
    return this.field.split(',').map(item => FieldItem.parse(item, 0, maxValidYear));
  }

  get warnings() {
    return getIncrementLargerThanRangeWarnings(this.items, this.first, maxValidYear);
  }

  nextYear(fromYear) {
    var _a;

    return (_a = this.items.reduce((years, item) => {
      var _a, _b, _c, _d;

      if (item.any) years.push(fromYear);else if (item.single) {
        const year = item.range.from;
        if (year >= fromYear) years.push(year);
      } else {
        const start = (_b = (_a = item.range) === null || _a === void 0 ? void 0 : _a.from) !== null && _b !== void 0 ? _b : this.first;
        if (start > fromYear) years.push(start);else {
          const nextYear = start + Math.ceil((fromYear - start) / item.step) * item.step;
          if (nextYear <= ((_d = (_c = item.range) === null || _c === void 0 ? void 0 : _c.to) !== null && _d !== void 0 ? _d : maxValidYear)) years.push(nextYear);
        }
      }
      return years;
    }, []).sort(sortAsc)[0]) !== null && _a !== void 0 ? _a : null;
  }

}

class CronosDate {
  constructor(year, month = 1, day = 1, hour = 0, minute = 0, second = 0) {
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = hour;
    this.minute = minute;
    this.second = second;
  }

  static fromDate(date, timezone) {
    if (!timezone) {
      return new CronosDate(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
    }

    return timezone['nativeDateToCronosDate'](date);
  }

  toDate(timezone) {
    if (!timezone) {
      return new Date(this.year, this.month - 1, this.day, this.hour, this.minute, this.second);
    }

    return timezone['cronosDateToNativeDate'](this);
  }

  static fromUTCTimestamp(timestamp) {
    const date = new Date(timestamp);
    return new CronosDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
  }

  toUTCTimestamp() {
    return Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second);
  }

  copyWith({
    year = this.year,
    month = this.month,
    day = this.day,
    hour = this.hour,
    minute = this.minute,
    second = this.second
  } = {}) {
    return new CronosDate(year, month, day, hour, minute, second);
  }

} // Adapted from Intl.DateTimeFormat timezone handling in https://github.com/moment/luxon

const ZoneCache = new Map();
class CronosTimezone {
  constructor(IANANameOrOffset) {
    if (typeof IANANameOrOffset === 'number') {
      if (IANANameOrOffset > 840 || IANANameOrOffset < -840) throw new Error('Invalid offset');
      this.fixedOffset = IANANameOrOffset;
      return this;
    }

    const offsetMatch = IANANameOrOffset.match(/^([+-]?)(0[1-9]|1[0-4])(?::?([0-5][0-9]))?$/);

    if (offsetMatch) {
      this.fixedOffset = (offsetMatch[1] === '-' ? -1 : 1) * (parseInt(offsetMatch[2], 10) * 60 + (parseInt(offsetMatch[3], 10) || 0));
      return this;
    }

    if (ZoneCache.has(IANANameOrOffset)) {
      return ZoneCache.get(IANANameOrOffset);
    }

    try {
      this.dateTimeFormat = new Intl.DateTimeFormat("en-US", {
        hour12: false,
        timeZone: IANANameOrOffset,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch (err) {
      throw new Error('Invalid IANA name or offset');
    }

    this.zoneName = IANANameOrOffset;
    const currentYear = new Date().getUTCFullYear();
    this.winterOffset = this.offset(Date.UTC(currentYear, 0, 1));
    this.summerOffset = this.offset(Date.UTC(currentYear, 5, 1));
    ZoneCache.set(IANANameOrOffset, this);
  }

  toString() {
    if (this.fixedOffset) {
      const absOffset = Math.abs(this.fixedOffset);
      return [this.fixedOffset < 0 ? '-' : '+', Math.floor(absOffset / 60).toString().padStart(2, '0'), (absOffset % 60).toString().padStart(2, '0')].join('');
    }

    return this.zoneName;
  }

  offset(ts) {
    if (!this.dateTimeFormat) return this.fixedOffset || 0;
    const date = new Date(ts);
    const {
      year,
      month,
      day,
      hour,
      minute,
      second
    } = this.nativeDateToCronosDate(date);
    const asUTC = Date.UTC(year, month - 1, day, hour, minute, second),
          asTS = ts - ts % 1000;
    return (asUTC - asTS) / 60000;
  }

  nativeDateToCronosDate(date) {
    if (!this.dateTimeFormat) {
      return CronosDate['fromUTCTimestamp'](date.getTime() + (this.fixedOffset || 0) * 60000);
    }

    return this.dateTimeFormat['formatToParts'] ? partsOffset(this.dateTimeFormat, date) : hackyOffset(this.dateTimeFormat, date);
  }

  cronosDateToNativeDate(date) {
    if (!this.dateTimeFormat) {
      return new Date(date['toUTCTimestamp']() - (this.fixedOffset || 0) * 60000);
    }

    const provisionalOffset = (date.month > 3 || date.month < 11 ? this.summerOffset : this.winterOffset) || 0;
    const UTCTimestamp = date['toUTCTimestamp'](); // Find the right offset a given local time.
    // Our UTC time is just a guess because our offset is just a guess

    let utcGuess = UTCTimestamp - provisionalOffset * 60000; // Test whether the zone matches the offset for this ts

    const o2 = this.offset(utcGuess); // If so, offset didn't change and we're done

    if (provisionalOffset === o2) return new Date(utcGuess); // If not, change the ts by the difference in the offset

    utcGuess -= (o2 - provisionalOffset) * 60000; // If that gives us the local time we want, we're done

    const o3 = this.offset(utcGuess);
    if (o2 === o3) return new Date(utcGuess); // If it's different, we're in a hole time. The offset has changed, but the we don't adjust the time

    return new Date(UTCTimestamp - Math.min(o2, o3) * 60000);
  }

}

function hackyOffset(dtf, date) {
  const formatted = dtf.format(date).replace(/\u200E/g, ""),
        parsed = formatted.match(/(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/),
        [, month, day, year, hour, minute, second] = (parsed !== null && parsed !== void 0 ? parsed : []).map(n => parseInt(n, 10));
  return new CronosDate(year, month, day, hour % 24, minute, second);
}

function partsOffset(dtf, date) {
  const formatted = dtf.formatToParts(date);
  return new CronosDate(parseInt(formatted[4].value, 10), parseInt(formatted[0].value, 10), parseInt(formatted[2].value, 10), parseInt(formatted[6].value, 10) % 24, parseInt(formatted[8].value, 10), parseInt(formatted[10].value, 10));
}

const hourinms = 60 * 60 * 1000;

const findFirstFrom = (from, list) => list.findIndex(n => n >= from);

class CronosExpression {
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
        warnings = warnings.filter(warning => !!options.strict[warning.type]);
      }

      if (warnings.length > 0) {
        throw new Error(`Strict mode: Parsing failed with ${warnings.length} warnings`);
      }
    }

    const expr = new CronosExpression(cronstring, parsedFields[0].values, parsedFields[1].values, parsedFields[2].values, parsedFields[3].values, parsedFields[4].values, parsedFields[5]);
    expr.timezone = options.timezone instanceof CronosTimezone ? options.timezone : options.timezone !== undefined ? new CronosTimezone(options.timezone) : undefined;
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
      missingHour: showTzOpts && this.missingHour
    }).map(([key, val]) => val && key + ': ' + val).filter(s => s).join(', ');
    return `${this.cronString} (${timezone})`;
  }

  nextDate(afterDate = new Date()) {
    var _a;

    const fromCronosDate = CronosDate.fromDate(afterDate, this.timezone);

    if (((_a = this.timezone) === null || _a === void 0 ? void 0 : _a.fixedOffset) !== undefined) {
      return this._next(fromCronosDate).date;
    }

    const fromTimestamp = afterDate.getTime(),
          fromLocalTimestamp = fromCronosDate['toUTCTimestamp'](),
          prevHourLocalTimestamp = CronosDate.fromDate(new Date(fromTimestamp - hourinms), this.timezone)['toUTCTimestamp'](),
          nextHourLocalTimestamp = CronosDate.fromDate(new Date(fromTimestamp + hourinms), this.timezone)['toUTCTimestamp'](),
          nextHourRepeated = nextHourLocalTimestamp - fromLocalTimestamp === 0,
          thisHourRepeated = fromLocalTimestamp - prevHourLocalTimestamp === 0,
          thisHourMissing = fromLocalTimestamp - prevHourLocalTimestamp === hourinms * 2;

    if (this.skipRepeatedHour && thisHourRepeated) {
      return this._next(fromCronosDate.copyWith({
        minute: 59,
        second: 60
      }), false).date;
    }

    if (this.missingHour === 'offset' && thisHourMissing) {
      const nextDate = this._next(fromCronosDate.copyWith({
        hour: fromCronosDate.hour - 1
      })).date;

      if (!nextDate || nextDate.getTime() > fromTimestamp) return nextDate;
    }

    let {
      date: nextDate,
      cronosDate: nextCronosDate
    } = this._next(fromCronosDate);

    if (this.missingHour !== 'offset' && nextCronosDate && nextDate) {
      const nextDateNextHourTimestamp = nextCronosDate.copyWith({
        hour: nextCronosDate.hour + 1
      }).toDate(this.timezone).getTime();

      if (nextDateNextHourTimestamp === nextDate.getTime()) {
        if (this.missingHour === 'insert') {
          return nextCronosDate.copyWith({
            minute: 0,
            second: 0
          }).toDate(this.timezone);
        } // this.missingHour === 'skip'


        return this._next(nextCronosDate.copyWith({
          minute: 59,
          second: 59
        })).date;
      }
    }

    if (!this.skipRepeatedHour) {
      if (nextHourRepeated && (!nextDate || nextDate.getTime() > fromTimestamp + hourinms)) {
        nextDate = this._next(fromCronosDate.copyWith({
          minute: 0,
          second: 0
        }), false).date;
      }

      if (nextDate && nextDate < afterDate) {
        nextDate = new Date(nextDate.getTime() + hourinms);
      }
    }

    return nextDate;
  }

  _next(date, after = true) {
    const nextDate = this._nextYear(after ? date.copyWith({
      second: date.second + 1
    }) : date);

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
      if (!date) break;
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
      if (year === null) return null;
      nextDate = this._nextMonth(year === fromDate.year ? fromDate : new CronosDate(year));
      year++;
    }

    return nextDate;
  }

  _nextMonth(fromDate) {
    let nextMonthIndex = findFirstFrom(fromDate.month, this.months);
    let nextDate = null;

    while (!nextDate) {
      const nextMonth = this.months[nextMonthIndex];
      if (nextMonth === undefined) return null;
      nextDate = this._nextDay(nextMonth === fromDate.month ? fromDate : new CronosDate(fromDate.year, nextMonth));
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
      if (nextDay === undefined) return null;
      nextDate = this._nextHour(nextDay === fromDate.day ? fromDate : new CronosDate(fromDate.year, fromDate.month, nextDay));
      nextDayIndex++;
    }

    return nextDate;
  }

  _nextHour(fromDate) {
    let nextHourIndex = findFirstFrom(fromDate.hour, this.hours);
    let nextDate = null;

    while (!nextDate) {
      const nextHour = this.hours[nextHourIndex];
      if (nextHour === undefined) return null;
      nextDate = this._nextMinute(nextHour === fromDate.hour ? fromDate : new CronosDate(fromDate.year, fromDate.month, fromDate.day, nextHour));
      nextHourIndex++;
    }

    return nextDate;
  }

  _nextMinute(fromDate) {
    let nextMinuteIndex = findFirstFrom(fromDate.minute, this.minutes);
    let nextDate = null;

    while (!nextDate) {
      const nextMinute = this.minutes[nextMinuteIndex];
      if (nextMinute === undefined) return null;
      nextDate = this._nextSecond(nextMinute === fromDate.minute ? fromDate : new CronosDate(fromDate.year, fromDate.month, fromDate.day, fromDate.hour, nextMinute));
      nextMinuteIndex++;
    }

    return nextDate;
  }

  _nextSecond(fromDate) {
    const nextSecondIndex = findFirstFrom(fromDate.second, this.seconds),
          nextSecond = this.seconds[nextSecondIndex];
    if (nextSecond === undefined) return null;
    return fromDate.copyWith({
      second: nextSecond
    });
  }

}

const maxTimeout = Math.pow(2, 31) - 1;
const scheduledTasks = [];
let runningTimer = null;

function addTask(task) {
  if (task['_timestamp'] !== undefined) {
    const insertIndex = scheduledTasks.findIndex(t => t['_timestamp'] < task['_timestamp']);
    if (insertIndex >= 0) scheduledTasks.splice(insertIndex, 0, task);else scheduledTasks.push(task);
  }
}

function removeTask(task) {
  const removeIndex = scheduledTasks.indexOf(task);
  if (removeIndex >= 0) scheduledTasks.splice(removeIndex, 1);

  if (scheduledTasks.length === 0 && runningTimer) {
    clearTimeout(runningTimer);
    runningTimer = null;
  }
}

function runScheduledTasks(skipRun = false) {
  if (runningTimer) clearTimeout(runningTimer);
  const now = Date.now();
  const removeIndex = scheduledTasks.findIndex(task => task['_timestamp'] <= now);
  const tasksToRun = removeIndex >= 0 ? scheduledTasks.splice(removeIndex) : [];

  for (let task of tasksToRun) {
    if (!skipRun) task['_runTask']();

    if (task.isRunning) {
      task['_updateTimestamp']();
      addTask(task);
    }
  }

  const nextTask = scheduledTasks[scheduledTasks.length - 1];

  if (nextTask) {
    runningTimer = setTimeout(runScheduledTasks, Math.min(nextTask['_timestamp'] - Date.now(), maxTimeout));
  } else runningTimer = null;
}

function refreshSchedulerTimer() {
  for (const task of scheduledTasks) {
    task['_updateTimestamp']();
    if (!task.isRunning) removeTask(task);
  }

  scheduledTasks.sort((a, b) => b['_timestamp'] - a['_timestamp']);
  runScheduledTasks(true);
}

class DateArraySequence {
  constructor(dateLikes) {
    this._dates = dateLikes.map(dateLike => {
      const date = new Date(dateLike);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      return date;
    }).sort((a, b) => a.getTime() - b.getTime());
  }

  nextDate(afterDate) {
    const nextIndex = this._dates.findIndex(d => d > afterDate);

    return nextIndex === -1 ? null : this._dates[nextIndex];
  }

}

class CronosTask {
  constructor(sequenceOrDates) {
    this._listeners = {
      'started': new Set(),
      'stopped': new Set(),
      'run': new Set(),
      'ended': new Set()
    };
    if (Array.isArray(sequenceOrDates)) this._sequence = new DateArraySequence(sequenceOrDates);else if (typeof sequenceOrDates === 'string' || typeof sequenceOrDates === 'number' || sequenceOrDates instanceof Date) this._sequence = new DateArraySequence([sequenceOrDates]);else this._sequence = sequenceOrDates;
  }

  start() {
    if (!this.isRunning) {
      this._updateTimestamp();

      addTask(this);
      runScheduledTasks();
      if (this.isRunning) this._emit('started');
    }

    return this;
  }

  stop() {
    if (this.isRunning) {
      this._timestamp = undefined;
      removeTask(this);

      this._emit('stopped');
    }

    return this;
  }

  get nextRun() {
    return this.isRunning ? new Date(this._timestamp) : undefined;
  }

  get isRunning() {
    return this._timestamp !== undefined;
  }

  _runTask() {
    this._emit('run', this._timestamp);
  }

  _updateTimestamp() {
    const nextDate = this._sequence.nextDate(new Date());

    this._timestamp = nextDate ? nextDate.getTime() : undefined;
    if (!this.isRunning) this._emit('ended');
  }

  on(event, listener) {
    this._listeners[event].add(listener);

    return this;
  }

  off(event, listener) {
    this._listeners[event].delete(listener);

    return this;
  }

  _emit(event, ...args) {
    this._listeners[event].forEach(listener => {
      listener.call(this, ...args);
    });
  }

}

function scheduleTask(cronString, task, options) {
  const expression = CronosExpression.parse(cronString, options);
  return new CronosTask(expression).on('run', task).start();
}
function validate(cronString, options) {
  try {
    CronosExpression.parse(cronString, options);
  } catch (_unused) {
    return false;
  }

  return true;
}

exports.CronosExpression = CronosExpression;
exports.CronosTask = CronosTask;
exports.CronosTimezone = CronosTimezone;
exports.refreshSchedulerTimer = refreshSchedulerTimer;
exports.scheduleTask = scheduleTask;
exports.validate = validate;
//# sourceMappingURL=index.js.map
