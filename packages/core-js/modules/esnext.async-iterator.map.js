// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var map = require('../internals/async-iterator-map');

$({ target: 'AsyncIterator', proto: true, real: true }, {
  map: map
});

