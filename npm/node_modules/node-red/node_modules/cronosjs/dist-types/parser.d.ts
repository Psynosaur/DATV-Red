export declare enum WarningType {
    IncrementLargerThanRange = "IncrementLargerThanRange"
}
export interface Warning {
    type: WarningType;
    message: string;
}
export declare function _parse(cronstring: string): [
    SecondsOrMinutesField,
    SecondsOrMinutesField,
    HoursField,
    DaysField,
    MonthsField,
    YearsField
];
declare abstract class Field {
    protected field: string;
    abstract first: number;
    abstract last: number;
    constructor(field: string);
    protected parse(): FieldItem[];
    private _items?;
    protected get items(): FieldItem[];
    get values(): number[];
    get warnings(): Warning[];
    static getValues(items: FieldItem[], first: number, last: number): number[];
}
declare class FieldItem {
    itemString: string;
    range?: {
        from: number;
        to?: number;
    };
    step: number;
    private constructor();
    rangeLength(first: number, last: number): number;
    values(first: number, last: number): number[];
    get any(): boolean;
    get single(): boolean;
    static parse(item: string, first: number, last: number, allowCyclicRange?: boolean, transformer?: (n: number) => number): FieldItem;
    static asterisk: FieldItem;
}
export declare class SecondsOrMinutesField extends Field {
    readonly first = 0;
    readonly last = 59;
}
export declare class HoursField extends Field {
    readonly first = 0;
    readonly last = 23;
}
export declare class DaysField {
    lastDay: boolean;
    lastWeekday: boolean;
    daysItems: FieldItem[];
    nearestWeekdayItems: FieldItem[];
    daysOfWeekItems: FieldItem[];
    lastDaysOfWeekItems: FieldItem[];
    nthDaysOfWeekItems: {
        item: FieldItem;
        nth: number;
    }[];
    constructor(daysOfMonthField: string, daysOfWeekField: string);
    get values(): DaysFieldValues;
    get warnings(): Warning[];
    get allDays(): boolean;
}
export declare class DaysFieldValues {
    lastDay: boolean;
    lastWeekday: boolean;
    days: number[];
    nearestWeekday: number[];
    daysOfWeek: number[];
    lastDaysOfWeek: number[];
    nthDaysOfWeek: [number, number][];
    static fromField(field: DaysField): DaysFieldValues;
    getDays(year: number, month: number): number[];
}
export declare class MonthsField extends Field {
    readonly first = 1;
    readonly last = 12;
    constructor(field: string);
}
export declare class YearsField extends Field {
    readonly first = 1970;
    readonly last = 2099;
    constructor(field: string);
    protected parse(): FieldItem[];
    get warnings(): Warning[];
    nextYear(fromYear: number): number;
}
export {};
