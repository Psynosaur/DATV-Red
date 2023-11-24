const {inspect} = require('util');
const weak_daemon_provider = require('weak-daemon');
const {CpuT} = require('./cput');



/********************************************************************
 * Stores and manages cput samples:
 * - Estimates cput at desired timestamp
 * - Drops oldest sample if redundant
 */
class CpuTimes {

    /**
     * @param {object} minimum required sample age and sampling interval
     *                 Expired samples will be removed
     */
    constructor( { min_sample_age, sampling_interval} ) {

        this._cpu_t_samples = [];
        this._min_age = min_sample_age;
        this._self_timer = weak_daemon_provider.getInstance(sampling_interval, this, this.update);
    }



    /**
     * Start collecting data
     * Without this CpuTimes is useless
     */
    init() {
        this._self_timer.start(true);
    }



    /**
     * Add new sample and remove expired ones
     */
    update() {
        let current_cpu_t = CpuT.now();

        this._dataConsistencyCheck(current_cpu_t)

        this._removeExpiredSamples(current_cpu_t);

        if(this._isTotalCpuLoadIncreased(current_cpu_t)) {
            this._addSample(current_cpu_t);
        } else {
            this._replaceLastSample(current_cpu_t);
        }
    }



    /**
     * This function estimates cput at specific timestamp.
     * Why estimate ranther than direct use of existing samples?
     *  - to save time and memory sampling frequency is very low,
     *    so using closest sample will cause too big deviation
     *
     * @param {number}  estimation_timestamp  Timestamp of cput to estimate at
     * @param {CpuT}    current_cput  Helper, current CpuT instance
     * @param {boolean} use_closest_value_if_not_avail  If oldest timestamp is too young then use closes available value
     */
    cputAt(estimation_timestamp, current_cput, use_closest_value_if_not_avail) {

        let older = this._findOlderOrEqualNeighbour(estimation_timestamp);
        let younger = this._findYoungerNeighbour(estimation_timestamp);



        /* Oldest sample is too young:
         *  - unable estimate load at desired time
         *
         *     ESTIMATED   Oldest      Youngest   Current
         *      SAMPLE     sample       sample    sample
         *   -----|----------|-----...----|---------|------>
         *
         */
        if ( ! older) {
            if ( ! use_closest_value_if_not_avail) {
                return null;
            }
            else {

                if ( ! younger) {
                    return null;
                }

                older = younger;
                younger = null;
            }
        }


        /* If youngest sample is older than estimating sample
         * then treat current sample as youngest and use it to estimation
         *
         *      Oldest       Youngest   ESTIMATED     no       Current
         *      sample        sample     SAMPLE     samples    sample
         *   -----|-----...-----|----------|----------...---------|------>
         *
         */
        if ( ! younger) {
            younger       = new CpuT(current_cput.timestamp);
            younger.total = current_cput.total;
            younger.busy  = current_cput.busy;
        }


        /* Can I use existing samples to estimate sample at specific time?
         *
         *
         *      Oldest       ESTIMATED     Youngest   Current
         *      sample        SAMPLE        sample    sample
         *   -----|-----...-----|------...----|---------|------>
         *
         */
        let weight = (estimation_timestamp - older.timestamp) / (younger.timestamp - older.timestamp);


        let estimated_part_total = weight * (younger.total - older.total);
        let estimated_part_busy  = weight * (younger.busy  - older.busy);


        let estimated_cput   = new CpuT(estimation_timestamp);
        estimated_cput.total = older.total + estimated_part_total;
        estimated_cput.busy  = older.busy + estimated_part_busy;


        return estimated_cput;

    }



    /**
     * Finds cput sample that is  `(younger) AND (closest)`  to specific timestamp
     *
     * Reverse logic here:
     * IF timestamp bigger THEN sample is younger
     *
     *         Older                Younger
     *       neighbour  timestamp  neighbour
     *      -----|----------|----------|------->
     *   t_min                                t_max
     *
     *
     * @param {number} timestamp
     *
     * @returns {number|undefined}  undefined if such sample not exists
     */
    _findYoungerNeighbour(timestamp) {

        // younger than given timestamp
        let younger = this._cpu_t_samples.filter( cpu_t =>
            cpu_t.timestamp > timestamp
        );

        // find min (find the oldest from those who)
        return younger.reduce( (prev, curr) =>
            (prev.timestamp <= curr.timestamp)  ?  prev  :  curr
        , younger[0]);

    }



    /**
     * Finds cput sample that is  `(older OR equal) AND (closest)`  to specific timestamp
     *
     * For purpose of future cput estimations
     * it is important to treat neighbour as older
     * also if it's timestamp is exatly the same as we are looking for
     *
     * Reverse logic here:
     * IF timestamp smaller THEN sample is older
     *
     *         Older                Younger
     *       neighbour  timestamp  neighbour
     *      -----|----------|----------|------->
     *   t_min                                t_max
     *
     *
     * @param {number} timestamp
     *
     * @returns {number|undefined}  undefined if such sample not exists
     */
    _findOlderOrEqualNeighbour(timestamp) {

        // equal or older than given timestamp
        let older = this._cpu_t_samples.filter( cpu_t =>
            cpu_t.timestamp <= timestamp
        );

        // find max (find the youngest from those who left)
        return older.reduce( (prev, curr) =>
             (prev.timestamp >= curr.timestamp)  ?  prev  :  curr
        , older[0]);
    }



    /**
     * Removes redundant samples - only one oldest than this._min_age should stay
     * @private
     * @param {CpuT} current_cpu_t  Current CpuT
     */
    _removeExpiredSamples(current_cpu_t) {
        let current_timestamp = current_cpu_t.timestamp;

        if(parseInt(current_timestamp) !== current_timestamp) {
            throw new Error(`Internal module error. Current timestamp: ${current_timestamp}`);
        }

        if(this._cpu_t_samples.length < 2) {
            return;
        }

        let oldest_required_sample = this._findOlderOrEqualNeighbour(current_timestamp - this._min_age);

        if( oldest_required_sample ) {
            this._cpu_t_samples = this._cpu_t_samples.filter( cpu_t =>
                cpu_t.timestamp >= oldest_required_sample.timestamp
            );
        }
    }



    _isTotalCpuLoadIncreased(current_cpu_t) {
        let last_cpu_t = this._cpu_t_samples[0] || new CpuT(0);

        return current_cpu_t.total > last_cpu_t.total;
    }



    _replaceLastSample(current_cpu_t) {
        this._cpu_t_samples[0] = current_cpu_t;
    }



    _addSample(current_cpu_t) {
        this._cpu_t_samples.unshift(current_cpu_t);
    }



    _dataConsistencyCheck(current_cpu_t) {
        let last_cpu_t = this._cpu_t_samples[0] || new CpuT( -1 );

        if(current_cpu_t.total     <  last_cpu_t.total ||
           current_cpu_t.timestamp <= last_cpu_t.timestamp) {
            console.log(`Warning:
                loadavg-windows anomaly detected.

                ! Expect that "os.loadavg()" may no longer work properly for 15 minutes from this warning occurrence.

                Supposed root cause:
                - operating system date has ben recently moved backward
                - operating system provided incorrect data about cpu times "os.cpus()"
                - Node.js "os.cpus()" api changed

                *If you think that bug is in loadavg-windows code then please contact author including below:

                Module:    loadavg-windows
                Class:     CpuTimes
                Function:  _dataConsistencyCheck

                Details:

                    Current timestamp:  ${current_cpu_t.timestamp}
                    Current total:      ${current_cpu_t.total}
                    Current busy:       ${current_cpu_t.busy}

                    Previous timestamp: ${last_cpu_t.timestamp}
                    Previous total:     ${last_cpu_t.total}
                    Previous busy:      ${last_cpu_t.busy}

                    CpuTimes samples: ${inspect(this._cpu_t_samples)}
            `);
        }
    }
}



exports.CpuTimes = CpuTimes;
