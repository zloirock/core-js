// Shortcuts for property names
var PROTOTYPE      = 'prototype'
  , OBJECT         = 'Object'
  , FUNCTION       = 'Function'
  , ARRAY          = 'Array'
  , STRING         = 'String'
  , NUMBER         = 'Number'
  , REGEXP         = 'RegExp'
  , MAP            = 'Map'
  , SET            = 'Set'
  , WEAKMAP        = 'WeakMap'
  , WEAKSET        = 'WeakSet'
  // Aliases global objects and prototypes
  , Function       = global[FUNCTION]
  , Object         = global[OBJECT]
  , Array          = global[ARRAY]
  , String         = global[STRING]
  , Number         = global[NUMBER]
  , RegExp         = global[REGEXP]
  , Map            = global[MAP]
  , Set            = global[SET]
  , WeakMap        = global[WEAKMAP]
  , WeakSet        = global[WEAKSET]
  , $Promise       = global.Promise
  , Math           = global.Math
  , TypeError      = global.TypeError
  , setTimeout     = global.setTimeout
  , clearTimeout   = global.clearTimeout
  , setInterval    = global.setInterval
  , setImmediate   = global.setImmediate
  , clearImmediate = global.clearImmediate
  , console        = global.console || {}
  , document       = global.document
  , Infinity       = 1 / 0
  , $Array         = Array[PROTOTYPE]
  , $Object        = Object[PROTOTYPE]
  , $Function      = Function[PROTOTYPE];
  
// 7.2.3 SameValue(x, y)
var same = Object.is || function(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !==y;
}
// http://jsperf.com/core-js-isobject
function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
// native function?
var nativeRegExp = /^\s*function[^{]+\{\s*\[native code\]\s*\}\s*$/;
function isNative(it){
  return nativeRegExp.test(it);
}
// object internal [[Class]]
// http://jsperf.com/core-js-classof
var toString = $Object.toString;
function classof(it){
  return it == undefined ? it === undefined ? 'Undefined' : 'Null' : toString.call(it).slice(8, -1);
}

// Function:
var apply = $Function.apply
  , call  = $Function.call
  , _ = {};
// partial apply
function part(/*args...*/){
  var length = arguments.length
    , args   = Array(length)
    , i      = 0
    , placeholder = false;
  while(length > i)if((args[i] = arguments[i++]) === _)placeholder = true;
  return createPartialApplication(this, args, length, placeholder, false);
}
function ctx(fn, that){
  assertFunction(fn);
  return function(/*args...*/){
    return fn.apply(that, arguments);
  }
}
function createPartialApplication(fn, argsPart, lengthPart, placeholder, bind, context){
  assertFunction(fn);
  return function(/*args...*/){
    var that   = bind ? context : this
      , length = arguments.length
      , i = 0, j = 0, args;
    if(!placeholder && length == 0)return fn.apply(that, argsPart);
    args = argsPart.slice();
    if(placeholder)for(;lengthPart > i; i++)if(args[i] === _)args[i] = arguments[j++];
    while(length > j)args.push(arguments[j++]);
    return fn.apply(that, args);
  }
}
// unbind method from context
// foo.fn(arg1, arg2, ...) => fn(foo, arg1, arg2, ...)
function unbind(that){
  return function(){
    return call.apply(that, arguments);
  }
}
// add `this` as first argument
// fn(foo, arg1, arg2, ...) => foo.fn(arg1, arg2, ...)
function methodize(){
  var fn = this;
  return function(/*args...*/){
    var length = arguments.length
      , args   = Array(length + 1)
      , i      = 0;
    args[0] = this;
    while(length > i)args[i + 1] = arguments[i++];
    return apply.call(fn, undefined, args);
  }
}

// Object:
var _hasOwn = $Object.hasOwnProperty;
function has(object, key){
  return _hasOwn.call(object, key);
}
var create                   = Object.create
  , getPrototypeOf           = Object.getPrototypeOf
  , defineProperty           = Object.defineProperty
  , defineProperties         = Object.defineProperties
  , getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
  , keys                     = Object.keys
  , getOwnPropertyNames      = Object.getOwnPropertyNames
  , isEnumerable             = $Object.propertyIsEnumerable
  , __PROTO__ = '__proto__' in $Object
  , DESCRIPTORS = true
  // Dummy, fix for not array-like ES3 string in es5.js
  , ES5Object = Object;
// http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
function getOwnPropertyDescriptors(object){
  var result = {}
    , names  = getOwnPropertyNames(object)
    , length = names.length
    , i      = 0
    , key;
  while(length > i)result[key = names[i++]] = getOwnPropertyDescriptor(object, key);
  return result;
}
// http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
function getPropertyDescriptor(object, key){
  if(key in object)do {
    if(has(object, key))return getOwnPropertyDescriptor(object, key);
  } while(object = getPrototypeOf(object));
}
// 19.1.2.1 Object.assign ( target, source )
var assign = Object.assign || function(target, source){
  target = Object(target);
  source = ES5Object(source);
  var props  = keys(source)
    , length = props.length
    , i      = 0
    , key;
  while(length > i)target[key = props[i++]] = source[key];
  return target;
}

// Array:
// array('str1,str2,str3') => ['str1', 'str2', 'str3']
function array(it){
  return String(it).split(',');
}
var push     = $Array.push
  , unshift  = $Array.unshift
  , slice    = $Array.slice
  , $indexOf = unbind($Array.indexOf)
  , $forEach = unbind($Array.forEach)
  , $slice   = Array.slice || function(arrayLike, from){
      return slice.call(arrayLike, from);
    }
// simple reduce to object
function transform(target, callbackfn){
  if(arguments.length < 2){
    callbackfn = target;
    target = {};
  } else target = Object(target);
  assertFunction(callbackfn);
  var self   = ES5Object(this)
    , length = toLength(self.length)
    , i      = 0;
  for(;length > i; i++)i in self && callbackfn(target, self[i], i, this);
  return target;
}

// Math:
var ceil   = Math.ceil
  , floor  = Math.floor
  , max    = Math.max
  , min    = Math.min
  , pow    = Math.pow
  , random = Math.random
  , MAX_SAFE_INTEGER = pow(2, 53) - 1; // 0x1fffffffffffff == 9007199254740991
// 7.1.4 ToInteger
var toInteger = Number.toInteger || function(it){
  return (it = +it) != it ? 0 : it != 0 && it != Infinity && it != -Infinity ? (it > 0 ? floor : ceil)(it) : it;
}
// 7.1.15 ToLength
function toLength(it){
  return it > 0 ? min(toInteger(it), MAX_SAFE_INTEGER) : 0;
}

// Assertion & errors:
var REDUCE_ERROR = 'Reduce of empty object with no initial value';
function assert(condition){
  if(!condition)throw TypeError($slice(arguments, 1).join(' '));
}
function assertFunction(it){
  if(!isFunction(it))throw TypeError(it + 'is not a function!');
}
function assertObject(it){
  if(!isObject(it))throw TypeError(it + 'is not an object!');
}
function assertInstance(it, constructor, name){
  assert(it instanceof constructor, name, ": please use the 'new' operator!");
}

var symbolUniq = 0;
function symbol(key){
  return '@@' + key + '_' + (++symbolUniq + random()).toString(36);
}
function descriptor(bitmap, value){
  return {
    enumerable  : !!(bitmap & 1),
    configurable: !!(bitmap & 2),
    writable    : !!(bitmap & 4),
    value       : value
  }
}
function hidden(object, key, value){
  return defineProperty(object, key, descriptor(6, value));
}

var ITERATOR, forOf, isIterable, getIterator, objectIterators; // define in symbol & iterators modules

var GLOBAL = 1
  , STATIC = 2
  , PROTO  = 4;
function $define(type, name, source, forced /* = false */){
  var key, own, prop
    , isGlobal = type & GLOBAL
    , isStatic = type & STATIC
    , isProto  = type & PROTO
    , target   = isGlobal ? global : isStatic ? global[name] : (global[name] || $Object)[PROTOTYPE]
    , exports  = isGlobal ? _ : _[name] || (_[name] = {});
  if(isGlobal){
    forced = source;
    source = name;
  }
  for(key in source)if(has(source, key)){
    own  = !forced && target && has(target, key) && (!isFunction(target[key]) || isNative(target[key]));
    prop = own ? target[key] : source[key];
    // export to `_`
    exports[key] = isProto && isFunction(prop) ? unbind(prop) : prop;
    // if build as fremework, extend global objects
    framework && target && !own && (isGlobal || delete target[key])
      && defineProperty(target, key, descriptor(6 + !isProto, source[key]));
  }
}
function $defineTimer(key, fn){
  if(framework && global[key] != fn){
    global[key] = fn;
    _[key] = fn;
  } else _[key] = ctx(fn, global);
}
// wrap to prevent obstruction of the global constructors, when build as library
function wrapGlobalConstructor(Base){
  if(framework || !isNative(Base))return Base;
  function F(param){
    // used on constructors that takes 1 argument
    return this instanceof Base ? new Base(param) : Base(param);
  }
  F[PROTOTYPE] = Base[PROTOTYPE];
  return F;
}
// export `_`
var isExports = typeof module != 'undefined'
  , undescore = global._;
if(isExports)module.exports = _;
if(!isExports || framework){
  _.noConflict = function(){
    global._ = undescore;
    return _;
  }
  global._ = _;
}