'use strict';

class Metrics {
    constructor(tp, fp, fn, prec, rec, fscore) {
        this.tp = tp;
        this.fp = fp;
        this.fn = fn;
        this.prec = prec;
        this.rec = rec;
        this.fscore = fscore;
    }
}

module.exports = Metrics;