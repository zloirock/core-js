'use strict';
var $ = require('../internals/export');
var from = require('../internals/array-from');
var checkCorrectnessOfIteration = require('../internals/check-correctness-of-iteration');
var ITERATOR_RESULT_WEBKIT_BUG = require('../internals/iterator-result-webkit-bug');

var INCORRECT_ITERATION = ITERATOR_RESULT_WEBKIT_BUG || !checkCorrectnessOfIteration(function (iterable) {
  // eslint-disable-next-line es/no-array-from -- required for testing
  Array.from(iterable);
});

// `Array.from` method
// https://tc39.es/ecma262/#sec-array.from
$({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
  from: from,
});
