'use strict';
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Metrics = require('./metrics');
const EvalCounts = require('./counts');

const evaluate = exports.evaluate = function (tokens, delimiter, boundary) {
    tokens = tokens || [];
    delimiter = delimiter || '\t';
    boundary = boundary || /^$/ // regular expression (empty line)

    let counts = new EvalCounts();

    let num_features = null; // number of features per line
    let in_correct = false; // currently processed chunks is correct until now
    let last_correct = 'O'; // previous chunk tag in corpus
    let last_correct_type = ''; // type of previously identified chunk tag
    let last_guessed = 'O'; // previously identified chunk tag
    let last_guessed_type = ''; // type of previous chunk tag in corpus
    let boundary_symbol = '-X-';

    for (let line of tokens) {
        let features = line;
        if (typeof line === 'string') {
            line = line.replace(/[\r\n]$/);
            features = line.split(delimiter);
            
            let is_sent_boundary = boundary.test(line);
    
            if (is_sent_boundary) {
                features = [boundary_symbol, 'O', 'O'];
            }
        }

        let g = counts.parse_tag(features.pop());
        let c = counts.parse_tag(features.pop());
        let guessed = g[0];
        let correct = c[0];
        let guessed_type = g[1];
        let correct_type = c[1];
        let first_item = features.pop();

        if (first_item == boundary_symbol) {
            guessed = 'O';
        }

        let end_correct = endOfChunk(last_correct, correct, last_correct_type, correct_type);
        let end_guessed = endOfChunk(last_guessed, guessed, last_guessed_type, guessed_type);
        let start_correct = startOfChunk(last_correct, correct, last_correct_type, correct_type);
        let start_guessed = startOfChunk(last_guessed, guessed, last_guessed_type, guessed_type);

        if (in_correct) {
            if (end_correct && end_guessed && last_guessed_type === last_correct_type) {
                in_correct = false;
                counts.correct_chunk += 1;
                counts.t_correct_chunk[last_correct_type] += 1;
            } else if (end_correct != end_guessed || guessed_type != correct_type) {
                in_correct = false;
            }
        }

        if (start_correct && start_guessed && guessed_type == correct_type) {
            in_correct = true;
        }

        if (start_correct && correct_type) {
            counts.found_correct += 1;
            counts.t_found_correct[correct_type] += 1;
        }

        if (start_guessed && guessed_type) {
            counts.found_guessed += 1;
            counts.t_found_guessed[guessed_type] += 1;
        }

        if (first_item != boundary_symbol) {
            if (correct == guessed && guessed_type == correct_type) {
                counts.correct_tags += 1;
            }
            counts.token_counter += 1;
        }

        last_guessed = guessed;
        last_correct = correct;
        last_guessed_type = guessed_type;
        last_correct_type = correct_type;

    }

    if (in_correct && last_correct_type) {
        counts.correct_chunk += 1;
        counts.t_correct_chunk[last_correct_type] += 1;
    }

    return counts;
}





const endOfChunk = exports.endOfChunk = function (prev_tag, tag, prev_type, type) {
    // check if a chunk ended between the previous and current word
    // arguments: previous and current chunk tags, previous and current types

    if (prev_tag == 'E' || prev_tag == 'S') return true;

    if (prev_tag == 'B' && ['B', 'S', 'O'].indexOf(tag) >= 0) return true;
    if (prev_tag == 'I' && ['B', 'S', 'O'].indexOf(tag) >= 0) return true;

    if (prev_tag != 'O' && prev_tag !== '.' && prev_type != type) return true;

    // these chunks are assumed to have length 1
    if (['[', ']'].indexOf(prev_tag) >= 0) return true;

    return false;
}

const startOfChunk = exports.startOfChunk = function (prev_tag, tag, prev_type, type) {
    // check if a chunk started between the previous and current word
    // arguments: previous and current chunk tags, previous and current types

    if (tag == 'B' || tag == 'S') return true;

    if (prev_tag == 'E' && ['E', 'I'].indexOf(tag) >= 0) return true;
    if (prev_tag == 'S' && ['E', 'I'].indexOf(tag) >= 0) return true;
    if (prev_tag == 'O' && ['E', 'I'].indexOf(tag) >= 0) return true;

    if (tag != 'O' && tag !== '.' && prev_type != type) return true;

    // these chunks are assumed to have length 1
    if (['[', ']'].indexOf(tag) >= 0) return true;

    return false;
}

const measure_performance = exports.measure_performance = function (fn, delimiter, boundary) {
    let data = fs.readFileSync(fn, 'utf8');
    let sents = data.split('\n');
    let counts = evaluate(sents, delimiter);
    let metrics = get_metrics(counts);
    // console.log(metrics);
    return metrics;
}

const get_metrics = exports.get_metrics = function (counts) {
    let c = counts;
    let result = {};
    let mtr = metrics(counts);
    let overall = mtr.overall;
    let by_type = mtr.by_type;

    // console.log('get_metrics: ', overall, by_type);

    result.overall_info = {
        'number_of_tokens': c.token_counter,
        'number_of_correct_phrase': c.found_correct,
        'number_of_guessed_phrase': c.found_guessed,
        'number_of_correct_guessed_phrase': c.correct_chunk,

        'accuracy': (100. * c.correct_tags / c.token_counter),
        'precision': (100. * overall.prec),
        'recall': (100. * overall.rec),
        'f_measure': (100. * overall.fscore)
    }

    result.per_class = Object.create(null);
    _.forOwn(by_type, (m, clazz) => {
            result.per_class[clazz] = {
                'precision' : (100.*m.prec),
                'recall' : (100.*m.rec),
                'f_measure' : (100.*m.fscore),
                'number_of_guessed_tokens' : c.t_found_guessed[clazz]
            }
    });

    return result;
}

const metrics = exports.metrics = function (counts) {
    let c = counts;
    let overall = calculate_metrics(c.correct_chunk, c.found_guessed, c.found_correct);
    let types = uniq(c.t_found_correct, c.t_found_guessed);
    // console.log('exports.metrics: ', counts)
    let by_type = {};
    for (let t of types) {
        by_type[t] = calculate_metrics(
            c.t_correct_chunk[t],
            c.t_found_guessed[t],
            c.t_found_correct[t]
        )
    }

    return {
        overall: overall,
        by_type: by_type
    };
}

const calculate_metrics = exports.calculate_metrics = function (correct, guessed, total) {
    let tp = correct;
    let fp = guessed - correct;
    let fn = total - correct;
    let p = 0.,
        r = 0.,
        f = 0.;

    if (tp + fp != 0) p = (1. * tp) / (tp + fp);
    if (tp + fn != 0) r = (1. * tp) / (tp + fn);
    if (p + r != 0) f = (2 * p * r) / (p + r);

    return new Metrics(tp, fp, fn, p, r, f);
}

const uniq = exports.uniq = function () {
    let merge = _.assign({}, arguments);
    return _.keys(merge);
}
