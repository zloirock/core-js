var FREEZING = require('../internals/freezing');
var anObject = require('../internals/an-object');
var objectPreventExtensions = Object.preventExtensions;

// `Reflect.preventExtensions` method
// https://tc39.github.io/ecma262/#sec-reflect.preventextensions
require('../internals/export')({ target: 'Reflect', stat: true, sham: !FREEZING }, {
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
