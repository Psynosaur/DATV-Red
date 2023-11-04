import { WarningType, Warning } from './parser';
import { CronosTimezone } from './date';
import { DateSequence } from './scheduler';
export declare class CronosExpression implements DateSequence {
    readonly cronString: string;
    private readonly seconds;
    private readonly minutes;
    private readonly hours;
    private readonly days;
    private readonly months;
    private readonly years;
    private timezone?;
    private skipRepeatedHour;
    private missingHour;
    private _warnings;
    private constructor();
    static parse(cronstring: string, options?: {
        timezone?: string | number | CronosTimezone;
        skipRepeatedHour?: boolean;
        missingHour?: CronosExpression['missingHour'];
        strict?: boolean | {
            [key in WarningType]?: boolean;
        };
    }): CronosExpression;
    get warnings(): Warning[];
    toString(): string;
    nextDate(afterDate?: Date): Date | null;
    private _next;
    nextNDates(afterDate?: Date, n?: number): Date[];
    private _nextYear;
    private _nextMonth;
    private _nextDay;
    private _nextHour;
    private _nextMinute;
    private _nextSecond;
}
