var $ = require('../internals/export');
var objectToArray = require('../internals/object-to-array');

// `Object.entries` method
// https://tc39.github.io/ecma262/#sec-object.entries
$({ target: 'Object', stat: true }, {
  entries: function entries(O) {
    return objectToArray(O, true);
  }
});
