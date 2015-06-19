// 26.1.4 Reflect.deleteProperty(target, propertyKey)
var $def         = require('./$.def')
  , getDesc      = require('./$').getDesc
  , assertObject = require('./$.assert').obj;

$def($def.S, 'Reflect', {
  deleteProperty: function deleteProperty(target, propertyKey){
    var desc = getDesc(assertObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  }
});