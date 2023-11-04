export declare class CronosDate {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    constructor(year: number, month?: number, day?: number, hour?: number, minute?: number, second?: number);
    static fromDate(date: Date, timezone?: CronosTimezone): CronosDate;
    toDate(timezone?: CronosTimezone): Date;
    private static fromUTCTimestamp;
    private toUTCTimestamp;
    copyWith({ year, month, day, hour, minute, second }?: {
        year?: number | undefined;
        month?: number | undefined;
        day?: number | undefined;
        hour?: number | undefined;
        minute?: number | undefined;
        second?: number | undefined;
    }): CronosDate;
}
export declare class CronosTimezone {
    zoneName?: string;
    fixedOffset?: number;
    private dateTimeFormat?;
    private winterOffset?;
    private summerOffset?;
    constructor(IANANameOrOffset: string | number);
    toString(): string | undefined;
    private offset;
    private nativeDateToCronosDate;
    private cronosDateToNativeDate;
}
