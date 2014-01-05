var prototype      = 'prototype'
  // Aliases global objects prototypes and properties
  , Infinity       = 1 / 0
  , $Array         = Array[prototype]
  , $Function      = Function[prototype]
  , $Number        = Number[prototype]
  , $Object        = Object[prototype]
  , $String        = String[prototype]
  , defineProperty = Object.defineProperty
  , pop            = $Array.pop
  , push           = $Array.push
  , slice          = $Array.slice
  , unshift        = $Array.unshift
  , apply          = $Function.apply
  , call           = $Function.call
  , abs            = Math.abs
  , ceil           = Math.ceil
  , exp            = Math.exp
  , floor          = Math.floor
  , ln             = Math.log
  , max            = Math.max
  , min            = Math.min
  , pow            = Math.pow
  , random         = Math.random
  , sqrt           = Math.sqrt
  , protoInObject  = function(F){
      F = Function();
      return new F().__proto__ == F[prototype]
    }
  // How to get the context for calling the methods of the Array.prototype
  // Dummy, polyfill for not array-like strings for old ie in es5shim.js
  , arrayLikeSelf  = Object
  , isArray        = Array.isArray || function(it){
      return $toString(it) == '[object Array]'
    }
  , toArray        = Array.from || function(arrayLike){
      return slice.call(arrayLike)
    }
  , toString        = 'toString'
  // Unbind Object.prototype methods
  , _hasOwnProperty = $Object.hasOwnProperty
  , _toString = $Object[toString]
  , _isPrototypeOf = $Object.isPrototypeOf
  , _propertyIsEnumerable = $Object.propertyIsEnumerable
  , has = function(it, key){
      return _hasOwnProperty.call(it, key)
    }
  , $toString = function(it){
      return _toString.call(it)
    }
  , isPrototype = function(it, object){
      return _isPrototypeOf.call(it, object)
    }
  , isEnumerable = function(it, key){
      return _propertyIsEnumerable.call(it, key)
    }
  , $DESC        = true
  , REDUCE_ERROR = 'Reduce of empty object with no initial value'
  , nativeFunctionRegExp = /^\s*function[^{]+\{\s*\[native code\]\s*\}\s*$/;
// Object internal [[Class]]
function classof(it /*, args...*/){
  return it === null ? 'Null' : it == undefined
      ? 'Undefined' : $toString(it).slice(8, -1);
}
// Native function?
function isNative(it){
  return nativeFunctionRegExp.test(it)
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
// splitComma('str1,str2,str3') => ['str1', 'str2', 'str3']
function splitComma(it){
  return String(it).split(',');
}
function descriptor(bitmap, value){
  return {
    enumerable  : !!(bitmap & 1),
    configurable: !!(bitmap & 2),
    writable    : !!(bitmap & 4),
    value       : value
  }
}