// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toObject = require('./$.to-object');

require('./$.object-sap')('getOwnPropertyDescriptor', function($getOwnPropertyDescriptor){
  return function getOwnPropertyDescriptor(it, key){
    return $getOwnPropertyDescriptor(toObject(it), key);
  };
});