// 26.1.6 Reflect.get(target, propertyKey [, receiver])
var $            = require('./$')
  , $def         = require('./$.def')
  , assertObject = require('./$.assert').obj;

$def($def.S, 'Reflect', {
  get: function get(target, propertyKey/*, receiver*/){
    var receiver = arguments.length < 3 ? target : arguments[2]
      , desc = $.getDesc(assertObject(target), propertyKey), proto;
    if(desc)return $.has(desc, 'value')
      ? desc.value
      : desc.get === undefined
        ? undefined
        : desc.get.call(receiver);
    return $.isObject(proto = $.getProto(target))
      ? get(proto, propertyKey, receiver)
      : undefined;
  }
});