// 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
var $              = require('./$')
  , $def           = require('./$.def')
  , assertFunction = require('./$.assert').fn
  , isObject       = $.isObject
  , _apply         = Function.apply;

$def($def.S, 'Reflect', {
  construct: function construct(target, argumentsList /*, newTarget*/){
    var proto    = assertFunction(arguments.length < 3 ? target : arguments[2]).prototype
      , instance = $.create(isObject(proto) ? proto : Object.prototype)
      , result   = _apply.call(target, instance, argumentsList);
    return isObject(result) ? result : instance;
  }
});