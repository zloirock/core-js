var $ = require('../internals/export');
var objectDefinePropertyModile = require('../internals/object-define-property');

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
$({ target: 'Object', stat: true }, {
  defineProperty: objectDefinePropertyModile.f
});
