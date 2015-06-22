// 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
var $              = require('./$')
  , $def           = require('./$.def')
  , assertFunction = require('./$.assert').fn
  , isObject       = $.isObject
  , apply          = Function.apply
  , bind           = Function.bind || $.core.Function.prototype.bind;

$def($def.S, 'Reflect', {
  construct: function construct(target, argumentsList /*, newTarget*/){
    if(arguments.length < 3)return new (bind.apply(target, [null].concat(argumentsList)))();
    var proto    = assertFunction(arguments[2]).prototype
      , instance = $.create(isObject(proto) ? proto : Object.prototype)
      , result   = apply.call(target, instance, argumentsList);
    return isObject(result) ? result : instance;
  }
});