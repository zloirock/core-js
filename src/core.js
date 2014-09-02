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
  , setTimeout      = global.setTimeout
  , clearTimeout    = global.clearTimeout
  , setInterval     = global.setInterval
  , setImmediate    = global.setImmediate
  , clearImmediate  = global.clearImmediate
  , process         = global[PROCESS]
  , document        = global.document
  , ArrayProto      = Array[PROTOTYPE]
  , ObjectProto     = Object[PROTOTYPE]
  , FunctionProto   = Function[PROTOTYPE]
  , Infinity        = 1 / 0;

// 7.2.3 SameValue(x, y)
var same = Object.is || function(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
}
// 7.2.4 SameValueZero(x, y)
function sameValueZero(x, y){
  return x === y || x !== x && y !== y;
}

// http://jsperf.com/core-js-isobject
function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
// Native function?
var isNative = ctx(/./.test, /\[native code\]\s*\}\s*$/);

// Object internal [[Class]] or toStringTag
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring
var toString = ObjectProto[TO_STRING]
  , classes  = [ARGUMENTS, ARRAY, 'Boolean', DATE, 'Error', FUNCTION, NUMBER, REGEXP, STRING]
    // define in es6_symbol module
  , TOSTRINGTAG;
function setToStringTag(constructor, tag, stat){
  if(TOSTRINGTAG && constructor)set(stat ? constructor : constructor[PROTOTYPE], TOSTRINGTAG, tag);
}
function cof(it){
  return it == undefined ? it === undefined ? 'Undefined' : 'Null' : toString.call(it).slice(8, -1);
}
function classof(it){
  var klass = cof(it)
    , tag;
  if(klass == OBJECT && TOSTRINGTAG && (tag = it[TOSTRINGTAG]) && !~indexOf.call(classes, tag))return tag;
  return klass;
}

// Function
var apply = FunctionProto.apply
  , call  = FunctionProto.call;
// Partial apply
function part(/* ...args */){
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
  return function(/* ...args */){
    return fn.apply(that, arguments);
  }
}
// Internal partial application & context binding
function partial(fn, argsPart, lengthPart, holder, _, bind, context){
  assertFunction(fn);
  return function(/* ...args */){
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
  , hasOwnProperty   = ObjectProto.hasOwnProperty
  , __PROTO__        = '__proto__' in ObjectProto
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
function createObjectToArray(isEntries){
  return function(object){
    var O      = ES5Object(object)
      , keys   = getKeys(object)
      , length = keys.length
      , i      = 0
      , result = Array(length)
      , key;
    while(length > i)result[i] = isEntries ? [key = keys[i++], O[key]] : O[keys[i++]];
    return result;
  }
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
  var klass   = cof(it)
    , isArray = klass == ARRAY
    , index, result, i, l, keys, key;
  if(isArray || klass == OBJECT){
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

// Array
// array('str1,str2,str3') => ['str1', 'str2', 'str3']
function array(it){
  return String(it).split(',');
}
var push    = ArrayProto.push
  , unshift = ArrayProto.unshift
  , slice   = ArrayProto.slice
  , splice  = ArrayProto.splice
  , indexOf = ArrayProto.indexOf
  , forEach = ArrayProto[FOR_EACH];
  
/*
 * 0 -> forEach
 * 1 -> map
 * 2 -> filter
 * 3 -> some
 * 4 -> every
 * 5 -> find
 * 6 -> findIndex
 */
function createArrayMethod(type){
  var isMap       = type == 1
    , isFilter    = type == 2
    , isSome      = type == 3
    , isEvery     = type == 4
    , isFindIndex = type == 6
    , noholes     = type == 5 || isFindIndex;
  return function(callbackfn, thisArg /* = undefined */){
    var f      = optionalBind(callbackfn, thisArg)
      , O      = Object(this)
      , self   = ES5Object(O)
      , length = toLength(self.length)
      , index  = 0
      , result = isMap ? Array(length) : isFilter ? [] : undefined
      , val, res;
    for(;length > index; index++)if(noholes || index in self){
      val = self[index];
      res = f(val, index, O);
      if(type){
        if(isMap)result[index] = res;             // map
        else if(res)switch(type){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: push.call(result, val);         // filter
        } else if(isEvery)return false;           // every
      }
    }
    return isFindIndex ? -1 : isSome || isEvery ? isEvery : result;
  }
}
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

function createEscaper(regExp, replace, isStatic){
  var replacer = isObject(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  }
}

// Assertion & errors
var REDUCE_ERROR = 'Reduce of empty object with no initial value';
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
function assertFunction(it){
  assert(isFunction(it), it, ' is not a function!');
  return it;
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
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  }
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESCRIPTORS ? function(object, key, value){
    return defineProperty(object, key, descriptor(bitmap, value));
  } : simpleSet;
}
function uid(key){
  return SYMBOL + '(' + key + ')_' + (++sid + random())[TO_STRING](36);
}
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESCRIPTORS = !!function(){try{return defineProperty({}, 0, ObjectProto)}catch(e){}}()
  , sid         = 0
  , hidden      = createDefiner(1)
  , symbol      = Symbol || uid
  , set         = Symbol ? simpleSet : hidden;

// Collections & iterators variables, define in over modules
var ITERATOR
  , $for
  , isIterable
  , getIterator
  , objectIterators
  , COLLECTION_KEYS
  , SHIM;

// DOM
var html = document && document.documentElement;

// core
var core   = {}
  , path   = framework ? global : core
  , NODE   = cof(process) == PROCESS
  // type bitmap
  , FORCED = 1
  , GLOBAL = 2
  , STATIC = 4
  , PROTO  = 8
  , BIND   = 16
  , WRAP   = 32;
function $define(type, name, source){
  var key, own, out, exp
    , isGlobal = type & GLOBAL
    , target   = isGlobal ? global : (type & STATIC) ? global[name] : (global[name] || ObjectProto)[PROTOTYPE]
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // there is a similar native
    own = !(type & FORCED) && target && key in target && (!isFunction(target[key]) || isNative(target[key]));
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    if(type & BIND && own)exp = ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & WRAP && !framework && target[key] == out){
      exp = function(param){
        return this instanceof out ? new out(param) : out(param);
      }
      exp[PROTOTYPE] = out[PROTOTYPE];
    } else exp = type & PROTO && isFunction(out) ? ctx(call, out) : out;
    // .CORE mark
    if(!own)out.CORE = exp.CORE = true;
    // export to `core`
    if(exports[key] != out)exports[key] = exp;
    // if build as framework, extend global objects
    framework && target && !own && (isGlobal || delete target[key]) && hidden(target, key, out);
  }
}
// Placeholder
core._ = path._ = framework ? path._ || {} : {};
// Node.js export
if(NODE)module.exports = core;
// Export to global object
if(!NODE || framework)global.core = core;