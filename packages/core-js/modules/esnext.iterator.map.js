var $ = require('../internals/export');
var map = require('../internals/iterator-map');

// `Iterator.prototype.map` method
// https://github.com/tc39/proposal-iterator-helpers
$({ target: 'Iterator', proto: true, real: true }, {
  map: map
});
