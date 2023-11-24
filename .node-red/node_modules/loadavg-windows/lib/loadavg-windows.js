const os = require('os');
const CpuTimes = require('./cpu-times').CpuTimes;
const CpuT = require('./cput').CpuT;



/********************************************************************
 * Constants used by LoadavgWindows module
 */
const NUM_OF_CORES = os.cpus().length;

/**
 * Configuration defaults
 */
const MS__1_MIN  = 60000;
const MS__5_MIN  = 5  * MS__1_MIN;
const MS__15_MIN = 15 * MS__1_MIN;


/**
 * Helper
 * @param {number} value
 */
function toFixed2(value) {
    return parseInt( value * 100 )  /  100;
}



/********************************************************************
 * Class that provides loadavg functionality
 */
class LoadavgWindows {

    constructor({time_period_0 = MS__1_MIN,
                 time_period_1 = MS__5_MIN,
                 time_period_2 = MS__15_MIN
                } = {
                 time_period_0 : MS__1_MIN,
                 time_period_1 : MS__5_MIN,
                 time_period_2 : MS__15_MIN
                }) {


        this._loadavg_period_0 = time_period_0;
        this._loadavg_period_1 = time_period_1;
        this._loadavg_period_2 = time_period_2;

        this._min_sample_age = Math.max(time_period_0, time_period_1, time_period_2);
        this._sampling_interval = Math.min(time_period_0, time_period_1, time_period_2);

        // CpuTimes have internal daemon that feeds it with fresh CpuT samples.
        // Samples of CpuT are the only thing required to calculate loadavg.
        this._cpu_times = new CpuTimes( {
            min_sample_age: this._min_sample_age,
            sampling_interval: this._sampling_interval
        });

    }



    init() {
        this._cpu_times.init();
    }



    loadavg() {
        let current_cpu_t = CpuT.now();


        return [
            this._loadavg(current_cpu_t, this._loadavg_period_0, true),  // default 1 min
            this._loadavg(current_cpu_t, this._loadavg_period_1, false), // default 5 min
            this._loadavg(current_cpu_t, this._loadavg_period_2, false)  // default 15 min
        ];
    }



    _loadavg(current_cpu_t, period_ms, use_closest_value_if_not_avail) {
        let target_timestamp = current_cpu_t.timestamp - period_ms;

        let estimated_cpu_t = this._cpu_times.cputAt(target_timestamp, current_cpu_t, use_closest_value_if_not_avail);

        if( ! estimated_cpu_t ) {
            // Unable to estimate - no samples taken before specific time
            return 0;
        }


        let total = current_cpu_t.total - estimated_cpu_t.total;
        let busy = current_cpu_t.busy - estimated_cpu_t.busy;

        let load = 0;
        if( total > 0 ) {
            load = NUM_OF_CORES * (busy/total);
        }

        return toFixed2(load);
    }
}



module.exports.LoadavgWindows = LoadavgWindows;
