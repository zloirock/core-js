// 19.1.2.13 Object.isSealed(O)
var isObject = require('core-js-internals/is-object');

require('./_object-sap')('isSealed', function ($isSealed) {
  return function isSealed(it) {
    return isObject(it) ? $isSealed ? $isSealed(it) : false : true;
  };
});
