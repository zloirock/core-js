// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var map = require('../internals/iterator-map');

$({ target: 'Iterator', proto: true, real: true }, {
  map: map
});
