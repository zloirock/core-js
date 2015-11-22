// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = require('./_to-object');

require('./_object-sap')('getPrototypeOf', function($getPrototypeOf){
  return function getPrototypeOf(it){
    return $getPrototypeOf(toObject(it));
  };
});