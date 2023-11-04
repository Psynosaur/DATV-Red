import { CronosExpression } from './expression';
import { CronosTask, refreshSchedulerTimer } from './scheduler';
import { CronosTimezone } from './date';
export function scheduleTask(cronString, task, options) {
    const expression = CronosExpression.parse(cronString, options);
    return new CronosTask(expression)
        .on('run', task)
        .start();
}
export function validate(cronString, options) {
    try {
        CronosExpression.parse(cronString, options);
    }
    catch {
        return false;
    }
    return true;
}
export { CronosExpression, CronosTask, CronosTimezone, refreshSchedulerTimer };
