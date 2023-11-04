import { CronosExpression } from './expression';
import { CronosTask, refreshSchedulerTimer } from './scheduler';
import { CronosTimezone } from './date';
export declare function scheduleTask(cronString: string, task: (timestamp: number) => void, options: Parameters<typeof CronosExpression.parse>[1]): CronosTask;
export declare function validate(cronString: string, options?: {
    strict: NonNullable<Parameters<typeof CronosExpression.parse>[1]>['strict'];
}): boolean;
export { CronosExpression, CronosTask, CronosTimezone, refreshSchedulerTimer };
