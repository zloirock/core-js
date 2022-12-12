var $ = require('../internals/export');
var map = require('../internals/async-iterator-map');

// `AsyncIterator.prototype.map` method
// https://github.com/tc39/proposal-iterator-helpers
$({ target: 'AsyncIterator', proto: true, real: true }, {
  map: map
});

