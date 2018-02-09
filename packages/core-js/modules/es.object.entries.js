var internalEntries = require('./_object-to-array')(true);

// `Object.entries` method
// https://tc39.github.io/ecma262/#sec-object.entries
require('./_export')({ target: 'Object', stat: true }, {
  entries: function entries(O) {
    return internalEntries(O);
  }
});
