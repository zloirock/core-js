var $ = require('../internals/export');
var defineProperties = require('../internals/object-define-properties');

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
$({ target: 'Object', stat: true }, {
  defineProperties: defineProperties
});
