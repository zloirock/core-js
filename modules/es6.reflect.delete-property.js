// 26.1.4 Reflect.deleteProperty(target, propertyKey)
var $export  = require('./_export')
  , getDesc  = require('./_').getDesc
  , anObject = require('./_an-object');

$export($export.S, 'Reflect', {
  deleteProperty: function deleteProperty(target, propertyKey){
    var desc = getDesc(anObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  }
});