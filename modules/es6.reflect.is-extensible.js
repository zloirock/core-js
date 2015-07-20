// 26.1.10 Reflect.isExtensible(target)
var $def          = require('./$.def')
  , anObject      = require('./$.an-object')
  , _isExtensible = Object.isExtensible || require('./$.is-object');

$def($def.S, 'Reflect', {
  isExtensible: function isExtensible(target){
    return _isExtensible(anObject(target));
  }
});