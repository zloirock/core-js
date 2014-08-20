var global          = returnThis()
  // Shortcuts for [[Class]] & property names
  , OBJECT          = 'Object'
  , FUNCTION        = 'Function'
  , ARRAY           = 'Array'
  , STRING          = 'String'
  , NUMBER          = 'Number'
  , REGEXP          = 'RegExp'
  , DATE            = 'Date'
  , MAP             = 'Map'
  , SET             = 'Set'
  , WEAKMAP         = 'WeakMap'
  , WEAKSET         = 'WeakSet'
  , SYMBOL          = 'Symbol'
  , PROMISE         = 'Promise'
  , MATH            = 'Math'
  , ARGUMENTS       = 'Arguments'
  , PROTOTYPE       = 'prototype'
  , CONSTRUCTOR     = 'constructor'
  , TO_STRING       = 'toString'
  , FOR_EACH        = 'forEach'
  , PROCESS         = 'process'
  , CREATE_ELEMENT  = 'createElement'
  , SET_TIMEOUT     = 'setTimeout'
  , SET_INTERVAL    = 'setInterval'
  , SET_IMMEDIATE   = 'setImmediate'
  , CLEAR_IMMEDIATE = 'clearImmediate'
  // Aliases global objects and prototypes
  , Function        = global[FUNCTION]
  , Object          = global[OBJECT]
  , Array           = global[ARRAY]
  , String          = global[STRING]
  , Number          = global[NUMBER]
  , RegExp          = global[REGEXP]
  , Date            = global[DATE]
  , Map             = global[MAP]
  , Set             = global[SET]
  , WeakMap         = global[WEAKMAP]
  , WeakSet         = global[WEAKSET]
  , Symbol          = global[SYMBOL]
  , Promise         = global[PROMISE]
  , Math            = global[MATH]
  , TypeError       = global.TypeError
  , setTimeout      = global[SET_TIMEOUT]
  , clearTimeout    = global.clearTimeout
  , setInterval     = global[SET_INTERVAL]
  , setImmediate    = global[SET_IMMEDIATE]
  , clearImmediate  = global[CLEAR_IMMEDIATE]
  , process         = global[PROCESS]
  , document        = global.document
  , $Array          = Array[PROTOTYPE]
  , $Object         = Object[PROTOTYPE]
  , $Function       = Function[PROTOTYPE]
  , Infinity        = 1 / 0;

var Export = {}
  , path   = framework ? global : Export;
// Placeholder
Export._ = path._ = framework ? path._ || {} : {};
  
// 7.2.3 SameValue(x, y)
var same = Object.is || function(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
}
// 7.2.4 SameValueZero(x, y)
function sameValueZero(x, y){
  return x === y ? true : x !== x && y !== y;
}

// http://jsperf.com/core-js-isobject
function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
// Native function?
var isNative = ctx(/./.test, /^\s*function[^{]+\{\s*\[native code\]\s*\}\s*$/);

// Object internal [[Class]] or toStringTag
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring
var toString = $Object[TO_STRING]
  , classes  = [ARGUMENTS, ARRAY, 'Boolean', DATE, 'Error', FUNCTION, NUMBER, REGEXP, STRING]
  , TOSTRINGTAG; // define in es6_symbol module
function setToStringTag(constructor, tag, stat){
  if(TOSTRINGTAG && constructor)set(stat ? constructor : constructor[PROTOTYPE], TOSTRINGTAG, tag);
}
function classof(it){
  if(it == undefined)return it === undefined ? 'Undefined' : 'Null';
  var cof = toString.call(it).slice(8, -1)
    , tag;
  if(cof != OBJECT)return cof;
  if(TOSTRINGTAG && (tag = it[TOSTRINGTAG]) && !~indexOf.call(classes, tag))return tag;
  return cof;
}

// Function
var apply = $Function.apply
  , call  = $Function.call;
// Partial apply
function part(/*...args*/){
  var length = arguments.length
    , args   = Array(length)
    , i      = 0
    , _      = path._
    , holder = false;
  while(length > i)if((args[i] = arguments[i++]) === _)holder = true;
  return partial(this, args, length, holder, _, false);
}
// Simple context binding
function ctx(fn, that){
  assertFunction(fn);
  return function(/*...args*/){
    return fn.apply(that, arguments);
  }
}
// Internal partial application & context binding
function partial(fn, argsPart, lengthPart, holder, _, bind, context){
  assertFunction(fn);
  return function(/*...args*/){
    var that   = bind ? context : this
      , length = arguments.length
      , i = 0, j = 0, args;
    if(!holder && length == 0)return invoke(fn, argsPart, that);
    args = argsPart.slice();
    if(holder)for(;lengthPart > i; i++)if(args[i] === _)args[i] = arguments[j++];
    while(length > j)args.push(arguments[j++]);
    return invoke(fn, args, that);
  }
}
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
function invoke(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
}
function optionalBind(fn, that){
  assertFunction(fn);
  return that === undefined ? fn : function(a, b, c){
    return fn.call(that, a, b, c);
  }
}

// Object:
var create           = Object.create
  , getPrototypeOf   = Object.getPrototypeOf
  , defineProperty   = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnDescriptor = Object.getOwnPropertyDescriptor
  , getKeys          = Object.keys
  , getNames         = Object.getOwnPropertyNames
  , getSymbols       = Object.getOwnPropertySymbols
  , hasOwnProperty   = $Object.hasOwnProperty
  , isEnumerable     = $Object.propertyIsEnumerable
  , __PROTO__        = '__proto__' in $Object
  , DESCRIPTORS      = true
  // Dummy, fix for not array-like ES3 string in es5 module
  , ES5Object        = Object;
function has(object, key){
  return hasOwnProperty.call(object, key);
}
// 19.1.2.1 Object.assign(target, source, ...)
var assign = Object.assign || function(target, source){
  var T = Object(target)
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = ES5Object(arguments[i++])
      , keys   = getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
}
function getValues(object){
  var O      = ES5Object(object)
    , keys   = getKeys(object)
    , length = keys.length
    , i      = 0
    , result = Array(length);
  while(length > i)result[i] = O[keys[i++]];
  return result;
}
function keyOf(object, searchElement){
  var O      = ES5Object(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === searchElement)return key;
}
// Simple structured cloning
function clone(it, stack1, stack2){
  var cof     = classof(it)
    , isArray = cof == ARRAY
    , index, result, i, l, keys, key;
  if(isArray || cof == OBJECT){
    index = indexOf.call(stack1, it);
    if(~index)return stack2[index];
    stack1.push(it);
    stack2.push(result = isArray ? Array(l = it.length) : create(getPrototypeOf(it)));
    if(isArray){
      for(i = 0; l > i;)if(has(it, i))result[i] = clone(it[i++], stack1, stack2);
    } else {
      keys = getKeys(it);
      l    = keys.length;
      for(i = 0; l > i;)result[key = keys[i++]] = clone(it[key], stack1, stack2);
    }
    return result;
  }
  return it;
}
function $clone(){
  return clone(this, [], []);
}

// Array
// array('str1,str2,str3') => ['str1', 'str2', 'str3']
function array(it){
  return String(it).split(',');
}
var push    = $Array.push
  , unshift = $Array.unshift
  , slice   = $Array.slice
  , splice  = $Array.splice
  , indexOf = $Array.indexOf
  , forEach = $Array[FOR_EACH];
// Simple reduce to object
function turn(mapfn, target /* = [] */){
  assertFunction(mapfn);
  var memo   = target == undefined ? [] : Object(target)
    , O      = ES5Object(this)
    , length = toLength(O.length)
    , index  = 0;
  for(;length > index; index++){
    if(mapfn(memo, O[index], index, this) === false)break;
  }
  return memo;
}
function newGeneric(A, B){
  return new (typeof A == 'function' ? A : B);
}

// Math
var ceil   = Math.ceil
  , floor  = Math.floor
  , max    = Math.max
  , min    = Math.min
  , pow    = Math.pow
  , random = Math.random
  , MAX_SAFE_INTEGER = 0x1fffffffffffff; // pow(2, 53) - 1 == 9007199254740991
// 7.1.4 ToInteger
var toInteger = Number.toInteger || function(it){
  var n = +it;
  return n != n ? 0 : n != 0 && n != Infinity && n != -Infinity ? (n > 0 ? floor : ceil)(n) : n;
}
// 7.1.15 ToLength
function toLength(it){
  return it > 0 ? min(toInteger(it), MAX_SAFE_INTEGER) : 0;
}

// Assertion & errors
var REDUCE_ERROR = 'Reduce of empty object with no initial value';
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
function assertFunction(it){
  assert(isFunction(it), it, ' is not a function!');
}
function assertObject(it){
  assert(isObject(it), it, ' is not an object!');
  return it;
}
function assertInstance(it, Constructor, name){
  assert(it instanceof Constructor, name, ": use the 'new' operator!");
}

// Property descriptors & Symbol
function descriptor(bitmap, value){
  return {
    enumerable  : !!(bitmap & 1),
    configurable: !!(bitmap & 2),
    writable    : !!(bitmap & 4),
    value       : value
  }
}
function uid(key){
  return SYMBOL + '(' + key + ')_' + (++sid + random())[TO_STRING](36);
}
function hidden(object, key, value){
  return defineProperty(object, key, descriptor(6, value));
}
var sid    = 0
  , symbol = Symbol ? Symbol : uid
  , set    = Symbol
    ? function(object, key, value){
        object[key] = value;
        return object;
      }
    : hidden;

// Collections & iterators variables, define in over modules
var ITERATOR, $for, isIterable, getIterator, objectIterators, COLLECTION_KEYS, SHIM_MAP, SHIM_SET;

// Export
var GLOBAL = 1
  , STATIC = 2
  , PROTO  = 4;
function $define(type, name, source, forced /* = false */){
  var key, own, prop
    , isGlobal = type & GLOBAL
    , isStatic = type & STATIC
    , isProto  = type & PROTO
    , target   = isGlobal ? global : isStatic ? global[name] : (global[name] || $Object)[PROTOTYPE]
    , exports  = isGlobal ? Export : Export[name] || (Export[name] = {});
  if(isGlobal){
    forced = source;
    source = name;
  }
  for(key in source){
    own  = !forced && target && has(target, key) && (!isFunction(target[key]) || isNative(target[key]));
    prop = own ? target[key] : source[key];
    // export to `C`
    if(exports[key] != prop)exports[key] = isProto && isFunction(prop) ? ctx(call, prop) : prop;
    // if build as framework, extend global objects
    framework && target && !own && (isGlobal || delete target[key]) && hidden(target, key, source[key]);
  }
}
function $defineTimer(key, fn){
  if(framework)global[key] = fn;
  Export[key] = global[key] != fn ? fn : ctx(fn, global);
}
// Wrap to prevent obstruction of the global constructors, when build as library
function wrapGlobalConstructor(Base){
  if(framework || !isNative(Base))return Base;
  function F(param){
    // used on constructors that takes 1 argument
    return this instanceof Base ? new Base(param) : Base(param);
  }
  F[PROTOTYPE] = Base[PROTOTYPE];
  return F;
}
var isNode = classof(process) == PROCESS;
if(isNode)module.exports = Export;
if(!isNode || framework)global.C = Export;