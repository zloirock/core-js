var globalIsFinite = require('core-js-internals/global').isFinite;

// `Number.isFinite` method
// https://tc39.github.io/ecma262/#sec-number.isfinite
require('./_export')({ target: 'Number', stat: true }, {
  isFinite: function isFinite(it) {
    return typeof it == 'number' && globalIsFinite(it);
  }
});
