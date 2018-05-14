var globalIsFinite = require('../internals/global').isFinite;

// `Number.isFinite` method
// https://tc39.github.io/ecma262/#sec-number.isfinite
require('../internals/export')({ target: 'Number', stat: true }, {
  isFinite: function isFinite(it) {
    return typeof it == 'number' && globalIsFinite(it);
  }
});
