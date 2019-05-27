var $ = require('../internals/export');
var objectToArray = require('../internals/object-to-array');

// `Object.values` method
// https://tc39.github.io/ecma262/#sec-object.values
$({ target: 'Object', stat: true }, {
  values: function values(O) {
    return objectToArray(O);
  }
});
