// 26.1.10 Reflect.isExtensible(target)
var $def          = require('./$.def')
  , assertObject  = require('./$.assert').obj
  , _isExtensible = Object.isExtensible || require('./$').isObject;

$def($def.S, 'Reflect', {
  isExtensible: function isExtensible(target){
    return _isExtensible(assertObject(target));
  }
});