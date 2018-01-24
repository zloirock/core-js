// 26.1.12 Reflect.preventExtensions(target)
var anObject = require('core-js-internals/an-object');
var $preventExtensions = Object.preventExtensions;

require('./_export')({ target: 'Reflect', stat: true }, {
  preventExtensions: function preventExtensions(target) {
    anObject(target);
    try {
      if ($preventExtensions) $preventExtensions(target);
      return true;
    } catch (e) {
      return false;
    }
  }
});
