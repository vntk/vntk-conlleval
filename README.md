# @vntk/conlleval

CoNLL format evaluator for Node.

[![Join the chat at https://gitter.im/vntk/vntk-tagger](https://badges.gitter.im/vntk/vntk-tagger.svg)](https://gitter.im/vntk/vntk-tagger)
[![npm version](https://img.shields.io/npm/v/@vntk/conlleval.svg?style=flat)](https://www.npmjs.com/package/@vntk/conlleval)
[![npm downloads](https://img.shields.io/npm/dm/@vntk/conlleval.svg)](https://www.npmjs.com/package/@vntk/conlleval)
[![Travis](https://travis-ci.org/vntk/vntk-conlleval.svg?branch=master)](https://travis-ci.org/vntk/vntk-conlleval)

This repository was inspired by [connlleval.py](https://github.com/spyysalo/conlleval.py)

# Usage and Installation

Install using npm:

> npm install @vntk/conlleval

Then calculate the metrics:

```js
var conlleval = require('./conlleval');
var metrics = conlleval.measure_performance('./diff.txt');

console.log('CoNLL format evaluation:', metrics);
```

Result output:

```js
{ overall_info:
   { number_of_tokens: 66097,
     number_of_correct_phrase: 2996,
     number_of_guessed_phrase: 2959,
     number_of_correct_guessed_phrase: 2709,
     accuracy: 99.50073377006521,
     precision: 91.55119972963838,
     recall: 90.42056074766354,
     f_measure: 90.98236775818638 },
  per_class:
   { PER:
      { precision: 94.01574803149606,
        recall: 92.27202472952087,
        f_measure: 93.13572542901717,
        number_of_guessed_tokens: 1270 },
     LOC:
      { precision: 89.03043170559094,
        recall: 91.22552574329225,
        f_measure: 90.11461318051576,
        number_of_guessed_tokens: 1413 },
     ORG:
      { precision: 91.62995594713657,
        recall: 75.91240875912408,
        f_measure: 83.03393213572853,
        number_of_guessed_tokens: 227 },
     MISC:
      { precision: 100,
        recall: 100,
        f_measure: 100,
        number_of_guessed_tokens: 49 },
     constructor:
      { precision: 0,
        recall: 0,
        f_measure: 0,
        number_of_guessed_tokens: 0 } } }
```

# Contributing

Pull requests and stars are highly welcome.

For bugs and feature requests, please [create an issue](https://github.com/vntk/vntk-conlleval/issues/new).

LICENSE
========

MIT