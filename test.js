'use strict';
const test = require('tape');
const conlleval = require('./conlleval');

test('metrics calculation', function (t) {
    t.plan(8)

    let metrics = conlleval.measure_performance('./diff.txt', '\t').overall_info;

    t.equal(metrics.number_of_tokens, 66097, 'number_of_tokens');
    t.equal(metrics.number_of_correct_phrase, 2996, 'number_of_correct_phrase');
    t.equal(metrics.number_of_guessed_phrase, 2959, 'number_of_guessed_phrase');
    t.equal(metrics.number_of_correct_guessed_phrase, 2709, 'number_of_correct_guessed_phrase');
    t.true(metrics.accuracy - 99.50 < 0.1, 'accuracy score');
    t.true(metrics.precision - 91.55 < 0.1, 'precision score');
    t.true(metrics.recall - 90.42 < 0.1, 'recall score');
    t.true(metrics.f_measure - 90.98 < 0.1, 'f1 score');
})