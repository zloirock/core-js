var $ = require('../internals/export');
var anObject = require('../internals/an-object');

var objectPreventExtensions = Object.preventExtensions;

// `Reflect.preventExtensions` method
// https://tc39.es/ecma262/#sec-reflect.preventextensions
$({ target: 'Reflect', stat: true }, {
  preventExtensions: function preventExtensions(target) {
    anObject(target);
    try {
      objectPreventExtensions(target);
      return true;
    } catch (error) {
      return false;
    }
  },
});
