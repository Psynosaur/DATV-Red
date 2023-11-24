"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const weak_daemon_1 = require("./weak-daemon");
exports.WeakDaemon = weak_daemon_1.WeakDaemon;
/* Mock it for testing purposes */
function getInstance(interval_time, caller, task, task_arguments) {
    return new weak_daemon_1.WeakDaemon(interval_time, caller, task, task_arguments);
}
exports.getInstance = getInstance;
/* Mock it for testing purposes */
function getClass() {
    return weak_daemon_1.WeakDaemon;
}
exports.getClass = getClass;
;
//# sourceMappingURL=index.js.map