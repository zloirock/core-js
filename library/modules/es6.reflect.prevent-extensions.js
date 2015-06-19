// 26.1.12 Reflect.preventExtensions(target)
var $def               = require('./$.def')
  , assertObject       = require('./$.assert').obj
  , _preventExtensions = Object.preventExtensions;

$def($def.S, 'Reflect', {
  preventExtensions: function preventExtensions(target){
    assertObject(target);
    try {
      if(_preventExtensions)_preventExtensions(target);
      return true;
    } catch(e){
      return false;
    }
  }
});