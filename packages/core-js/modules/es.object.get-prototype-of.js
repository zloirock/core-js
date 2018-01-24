// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = require('core-js-internals/to-object');
var $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return $getPrototypeOf(toObject(it));
  };
});
