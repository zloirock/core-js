// 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
var $            = require('./$')
  , $def         = require('./$.def')
  , assertObject = require('./$.assert').obj;

$def($def.S, 'Reflect', {
  defineProperty: function defineProperty(target, propertyKey, attributes){
    assertObject(target);
    try {
      $.setDesc(target, propertyKey, attributes);
      return true;
    } catch(e){
      return false;
    }
  }
});