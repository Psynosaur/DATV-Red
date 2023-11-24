import { WeakDaemon } from './weak-daemon';
declare function getInstance(interval_time: number, caller: object | null, task: (...args: any[]) => any, task_arguments?: any[]): WeakDaemon;
declare function getClass(): typeof WeakDaemon;
export { getInstance };
export { getClass };
export { WeakDaemon };
