var internalValues = require('./_object-to-array')(false);

// `Object.values` method
// https://tc39.github.io/ecma262/#sec-object.values
require('./_export')({ target: 'Object', stat: true }, {
  values: function values(O) {
    return internalValues(O);
  }
});
