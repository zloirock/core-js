// 26.1.10 Reflect.isExtensible(target)
var anObject = require('core-js-internals/an-object');
var $isExtensible = Object.isExtensible;

require('./_export')({ target: 'Reflect', stat: true }, {
  isExtensible: function isExtensible(target) {
    anObject(target);
    return $isExtensible ? $isExtensible(target) : true;
  }
});
