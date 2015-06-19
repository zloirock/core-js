// 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
var $            = require('./$')
  , $def         = require('./$.def')
  , assertObject = require('./$.assert').obj;

$def($def.S, 'Reflect', {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey){
    return $.getDesc(assertObject(target), propertyKey);
  }
});