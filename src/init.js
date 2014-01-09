var prototype      = 'prototype'
  // Aliases global objects prototypes and properties
  , Infinity       = 1 / 0
  , $Array         = Array[prototype]
  , $Function      = Function[prototype]
  , $Number        = Number[prototype]
  , $Object        = Object[prototype]
  , $String        = String[prototype]
  , defineProperty = Object.defineProperty
  , push           = $Array.push
  , slice          = $Array.slice
  , apply          = $Function.apply
  , call           = $Function.call
  , abs            = Math.abs
  , ceil           = Math.ceil
  , floor          = Math.floor
  , max            = Math.max
  , min            = Math.min
  , pow            = Math.pow
  , random         = Math.random
  , DESCRIPTORS    = 1
  , REDUCE_ERROR   = 'Reduce of empty object with no initial value'
  // How to get the context for calling the methods of the Array.prototype
  // Dummy, polyfill for not array-like strings for old ie in es5shim.js
  , arrayLikeSelf  = Object
  , isArray        = Array.isArray || function(it){
      return toString(it) == '[object Array]'
    }
  , toArray        = Array.from || function(arrayLike){
      return slice.call(arrayLike)
    }
  , toStringKey    = 'toString'
  , $unbind        = unbind.call(unbind)
  , $part          = $unbind(part)
  // Unbind Object.prototype methods
  , has            = $unbind($Object.hasOwnProperty)
  , toString       = $unbind($Object[toStringKey])
  , isEnumerable   = $unbind($Object.propertyIsEnumerable)
  // Native function?
  , isNative       = RegExpToFunction.call(/^\s*function[^{]+\{\s*\[native code\]\s*\}\s*$/);
// Object internal [[Class]]
function classof(it){
  return it === undefined ? 'Undefined' : it == undefined ? 'Null'
    : toString(it).slice(8, -1)
}
// Simple bind context
function ctx(that){
  var fn = this;
  return function(){
    return fn.apply(that, arguments);
  }
}
// Unbind method from context
function unbind(){
  return ctx.call(call, this);
}
// Partiall apply
function part(/*args...*/){
  var fn = this
    , i = 0
    , length1 = arguments.length
    , args1 = Array(length1);
  while(length1 > i)args1[i] = arguments[i++];
  return function(/*args...*/){
    var args2 = args1.slice()
      , length2 = arguments.length
      , i = 0;
    while(length2 > i)args2[length1 + i] = arguments[i++];
    return apply.call(fn, this, args2)
  }
}
function RegExpToFunction(){
  var that = this;
  return function(it){
    return that.test(it)
  }
}
function extendBuiltInObject(target, source, forced /* = false */){
  for(var key in source){
    try {
      has(source, key)
      && (forced || !has(target, key) || !isNative(target[key]))
      && delete target[key]
      && defineProperty(target, key, descriptor(6, source[key]));
    } catch(e){}
  }
  return target
}
function descriptor(bitmap, value){
  return {
    enumerable  : !!(bitmap & 1),
    configurable: !!(bitmap & 2),
    writable    : !!(bitmap & 4),
    value       : value
  }
}
// splitComma('str1,str2,str3') => ['str1', 'str2', 'str3']
function splitComma(it){
  return String(it).split(',');
}