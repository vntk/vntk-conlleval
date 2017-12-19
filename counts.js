'use strict';
const defaultdict = require('defaultdict2');
const REGEX_IOB_TAG = /^([^-]*)-(.*)$/

class EvalCounts {
    constructor() {
        this.correct_chunk = 0; // number of correctly identified chunks
        this.correct_tags = 0; // number of correct chuck tags
        this.found_correct = 0; // number of chunks in corpus
        this.found_guessed = 0; // number of identified chunks
        this.token_counter = 0; // token counter (ignores sentence breaks)

        // count by type
        this.t_correct_chunk = defaultdict(0);
        this.t_found_correct = defaultdict(0);
        this.t_found_guessed = defaultdict(0);
    }

    get empty() {
        return Object.create(null);
    }

    parse_tag(tag) {
        let match = REGEX_IOB_TAG.exec(tag);
        return match ? [match[1], match[2]] : [null, null];
    }
}

module.exports = EvalCounts;