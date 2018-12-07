var INCORRECT_ITERATION = !require('../internals/check-correctness-of-iteration')(function (iterable) {
  Array.from(iterable);
});

// `Array.from` method
// https://tc39.github.io/ecma262/#sec-array.from
require('../internals/export')({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
  from: require('../internals/array-from')
});
