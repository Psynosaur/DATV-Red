export declare function refreshSchedulerTimer(): void;
export interface DateSequence {
    nextDate: (afterDate: Date) => Date | null;
}
declare type CronosTaskListeners = {
    'started': () => void;
    'stopped': () => void;
    'run': (timestamp: number) => void;
    'ended': () => void;
};
declare type DateLike = Date | string | number;
export declare class CronosTask {
    private _listeners;
    private _timestamp?;
    private _sequence;
    constructor(sequence: DateSequence);
    constructor(dates: DateLike[]);
    constructor(date: DateLike);
    start(): this;
    stop(): this;
    get nextRun(): Date | undefined;
    get isRunning(): boolean;
    private _runTask;
    private _updateTimestamp;
    on<K extends keyof CronosTaskListeners>(event: K, listener: CronosTaskListeners[K]): this;
    off<K extends keyof CronosTaskListeners>(event: K, listener: CronosTaskListeners[K]): this;
    private _emit;
}
export {};
