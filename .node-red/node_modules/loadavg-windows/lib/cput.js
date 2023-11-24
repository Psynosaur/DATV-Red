const os = require('os');

/********************************************************************
 * Data structure
 *
 * - timestamp: unix timestamp of taking below measurements
 * - busy:      time in milliseconds that all CPUs were  busy  since operating system start
 * - total:     time in milliseconds that all CPUs were  on (busy + idle)  since operating system start
 */
class CpuT {
    constructor(timestamp) {
        this.timestamp = timestamp;
        this.busy = 0;
        this.total = 0;
    }


    /**
     * @returns {CpuT} current cput
     */
    static now() {
        const cpu_t = new CpuT( Date.now() );
        let total = 0;
        let idle = 0;

        os.cpus().forEach( ({times:t}) => {
            total += t.user + t.nice + t.sys + t.idle + t.irq;
            idle += t.idle;
        });

        cpu_t.busy = total - idle;
        cpu_t.total = total;

        return cpu_t;
    }
}



exports.CpuT = CpuT;
