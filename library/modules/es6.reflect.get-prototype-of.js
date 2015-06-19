// 26.1.8 Reflect.getPrototypeOf(target)
var $def         = require('./$.def')
  , getProto     = require('./$').getProto
  , assertObject = require('./$.assert').obj;

$def($def.S, 'Reflect', {
  getPrototypeOf: function getPrototypeOf(target){
    return getProto(assertObject(target));
  }
});