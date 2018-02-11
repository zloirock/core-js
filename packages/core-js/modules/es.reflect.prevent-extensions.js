var anObject = require('core-js-internals/an-object');
var objectPreventExtensions = Object.preventExtensions;

// `Reflect.preventExtensions` method
// https://tc39.github.io/ecma262/#sec-reflect.preventextensions
require('../internals/export')({ target: 'Reflect', stat: true }, {
  preventExtensions: function preventExtensions(target) {
    anObject(target);
    try {
      if (objectPreventExtensions) objectPreventExtensions(target);
      return true;
    } catch (e) {
      return false;
    }
  }
});
