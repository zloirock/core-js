/**
 * Core.js v0.0.7
 * http://core.zloirock.ru
 * © 2014 Denis Pushkarev
 * Available under MIT license
 */
!function(global, framework, undefined){
'use strict';
/*****************************
 * Module : core
 *****************************/

// Shortcuts for [[Class]] & property names
var OBJECT          = 'Object'
  , FUNCTION        = 'Function'
  , ARRAY           = 'Array'
  , STRING          = 'String'
  , NUMBER          = 'Number'
  , REGEXP          = 'RegExp'
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
  , Infinity        = 1 / 0
  , $Array          = Array[PROTOTYPE]
  , $Object         = Object[PROTOTYPE]
  , $Function       = Function[PROTOTYPE]
  , Export          = {};
  
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
var nativeRegExp = /^\s*function[^{]+\{\s*\[native code\]\s*\}\s*$/;
function isNative(it){
  return nativeRegExp.test(it);
}
var toString = $Object[TO_STRING]
  , TOSTRINGTAG;
function setToStringTag(constructor, tag, stat){
  if(TOSTRINGTAG && constructor)set(stat ? constructor : constructor[PROTOTYPE], TOSTRINGTAG, tag);
}
// Object internal [[Class]]
function classof(it){
  if(it == undefined)return it === undefined ? 'Undefined' : 'Null';
  var cof = toString.call(it).slice(8, -1);
  return TOSTRINGTAG && cof == OBJECT && it[TOSTRINGTAG] ? it[TOSTRINGTAG] : cof;
}
function ES6ToString(){
  return '[object ' + classof(this) + ']';
}

// Function:
var apply = $Function.apply
  , call  = $Function.call
  , path  = framework ? global : Export;
Export._ = path._ = framework ? path._ || {} : {};
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
// http://jsperf.lnkit.com/fast-apply
function invoke(fn, args, that){
  if(that === undefined)switch(args.length){
    case 0: return fn();
    case 1: return fn(args[0]);
    case 2: return fn(args[0], args[1]);
    case 3: return fn(args[0], args[1], args[2]);
    case 4: return fn(args[0], args[1], args[2], args[3]);
    case 5: return fn(args[0], args[1], args[2], args[3], args[4]);
  } else switch(args.length){
    case 0: return fn.call(that);
    case 1: return fn.call(that, args[0]);
    case 2: return fn.call(that, args[0], args[1]);
    case 3: return fn.call(that, args[0], args[1], args[2]);
    case 4: return fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return fn.apply(that, args);
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
  // Dummy, fix for not array-like ES3 string in es5.js
  , ES5Object        = Object;
function has(object, key){
  return hasOwnProperty.call(object, key);
}
// 19.1.2.1 Object.assign ( target, source, ... )
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

// Array:
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
function keyOf(object, searchElement){
  var O      = ES5Object(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === searchElement)return key;
}
function newGeneric(A, B){
  return new (typeof A == 'function' ? A : B);
}

// Math:
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

// Assertion & errors:
var REDUCE_ERROR = 'Reduce of empty object with no initial value';
function assert(condition, _msg){
  if(!condition){
    var msg = _msg
      , i   = 2;
    while(arguments.length > i)msg += ' ' + arguments[i++];
    throw TypeError(msg);
  }
}
function assertFunction(it){
  if(!isFunction(it))throw TypeError(it + ' is not a function!');
}
function assertObject(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
}
function assertInstance(it, constructor, name){
  assert(it instanceof constructor, name, ": please use the 'new' operator!");
}

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

var ITERATOR, $for, isIterable, getIterator, objectIterators, COLLECTION_KEYS, SHIM_MAP, SHIM_SET; // define in over modules

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
// Export
var isNode = classof(process) == PROCESS;
if(isNode)module.exports = Export;
if(!isNode || framework)global.C = Export;

/*****************************
 * Module : es6_symbol
 *****************************/

/**
 * ECMAScript 6 Symbol
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol
 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-symbol-objects
 */
!function(TAG, $ITERATOR, $TOSTRINGTAG, SymbolRegistry){
  // 19.4.1.1 Symbol([description])
  if(!isNative(Symbol)){
    Symbol = function(description){
      if(this instanceof Symbol)throw new TypeError('Symbol is not a constructor');
      var tag = uid(description);
      defineProperty($Object, tag, {
        configurable: true,
        set: function(value){
          hidden(this, tag, value);
        }
      });
      return hidden(create(Symbol[PROTOTYPE]), TAG, tag);
    }
    hidden(Symbol[PROTOTYPE], TO_STRING, function(){
      return this[TAG];
    });
  }
  ITERATOR = $ITERATOR in Symbol
    ? Symbol[$ITERATOR]
    : uid(SYMBOL + '.' + $ITERATOR);
  TOSTRINGTAG = $TOSTRINGTAG in Symbol
    ? Symbol[$TOSTRINGTAG]
    : Symbol(SYMBOL + '.' + $TOSTRINGTAG);
  $define(GLOBAL, {Symbol: wrapGlobalConstructor(Symbol)}, 1);
  $define(STATIC, SYMBOL, {
    // 19.4.2.2 Symbol.for(key)
    'for': function(key){
      var k = '' + key;
      return has(SymbolRegistry, k) ? SymbolRegistry[k] : SymbolRegistry[k] = Symbol(k);
    },
    // 19.4.2.6 Symbol.iterator
    iterator: ITERATOR,
    // 19.4.2.7 Symbol.keyFor(sym)
    keyFor: part.call(keyOf, SymbolRegistry),
    // 19.4.2.10 Symbol.toStringTag
    toStringTag: TOSTRINGTAG,
    pure: symbol,
    set: set
  });
  setToStringTag(Symbol, SYMBOL);
}(symbol('tag'), 'iterator', TO_STRING + 'Tag', {});

/*****************************
 * Module : es6
 *****************************/

/**
 * ECMAScript 6 shim
 * http://people.mozilla.org/~jorendorff/es6-draft.html
 * http://wiki.ecmascript.org/doku.php?id=harmony:proposals
 * Alternatives:
 * https://github.com/paulmillr/es6-shim
 * https://github.com/monolithed/ECMAScript-6
 * https://github.com/inexorabletash/polyfill/blob/master/es6.md
 */
!function(isFinite){
  // 20.2.2.28 Math.sign(x)
  function sign(it){
    var n = +it;
    return n == 0 || n != n ? n : n < 0 ? -1 : 1;
  }
  $define(STATIC, OBJECT, {
    // 19.1.3.1 Object.assign(target, source)
    // The assign function is used to copy the values of all of the enumerable
    // own properties from a source object to a target object.
    assign: assign,
    // 19.1.3.10 Object.is(value1, value2)
    is: same
  });
  // 19.1.3.19 Object.setPrototypeOf(O, proto)
  // Works with __proto__ only. Old v8 can't works with null proto objects.
  __PROTO__ && (function(set){
    var buggy;
    try { set({}, $Array) }
    catch(e){ buggy = true }
    $define(STATIC, OBJECT, {
      setPrototypeOf: function(O, proto){
        assertObject(O);
        assert(isObject(proto) || proto === null, "Can't set", proto, 'as prototype');
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      }
    });
  })(ctx(call, getOwnDescriptor($Object, '__proto__').set));
  $define(STATIC, NUMBER, {
    // 20.1.2.1 Number.EPSILON
    EPSILON: pow(2, -52),
    // 20.1.2.2 Number.isFinite(number)
    isFinite: function(it){
      return typeof it == 'number' && isFinite(it);
    },
    // 20.1.2.3 Number.isInteger(number)
    isInteger: function(it){
      return isFinite(it) && floor(it) === it;
    },
    // 20.1.2.4 Number.isNaN(number)
    isNaN: function(number){
      return typeof number == 'number' && number != number;
    },
    // 20.1.2.5 Number.isSafeInteger(number)
    isSafeInteger: function(number){
      return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
    },
    // 20.1.2.6 Number.MAX_SAFE_INTEGER
    MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
    // 20.1.2.10 Number.MIN_SAFE_INTEGER
    MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
    // 20.1.2.12 Number.parseFloat(string)
    parseFloat: parseFloat,
    // 20.1.2.13 Number.parseInt(string, radix)
    parseInt: parseInt
  });
  var isInteger = Number.isInteger
    , abs       = Math.abs
    , exp       = Math.exp
    , log       = Math.log
    , sqrt      = Math.sqrt;
  function asinh(x){
    var n = +x;
    return !isFinite(n) || n === 0 ? n : n < 0 ? -asinh(-n) : log(n + sqrt(n * n + 1));
  }
  $define(STATIC, MATH, {
    // 20.2.2.3 Math.acosh(x)
    // Returns an implementation-dependent approximation to the inverse hyperbolic cosine of x.
    acosh: function(x){
      return log(x + sqrt(x * x - 1));
    },
    // 20.2.2.5 Math.asinh(x)
    // Returns an implementation-dependent approximation to the inverse hyperbolic sine of x.
    asinh: asinh,
    // 20.2.2.7 Math.atanh(x)
    // Returns an implementation-dependent approximation to the inverse hyperbolic tangent of x.
    atanh: function(x){
      return x === 0 ? x : .5 * log((1 + x) / (1 - x));
    },
    // 20.2.2.9 Math.cbrt(x)
    // Returns an implementation-dependent approximation to the cube root of x.
    cbrt: function(x){
      return sign(x) * pow(abs(x), 1 / 3);
    },
    // 20.2.2.11 Math.clz32 (x)
    clz32: function(x){
      var n = x >>> 0;
      return n ? 32 - n[TO_STRING](2).length : 32;
    },
    // 20.2.2.12 Math.cosh(x)
    // Returns an implementation-dependent approximation to the hyperbolic cosine of x.
    cosh: function(x){
      return (exp(x) + exp(-x)) / 2;
    },
    // 20.2.2.14 Math.expm1(x)
    // Returns an implementation-dependent approximation to subtracting 1 from the exponential function of x 
    expm1: function(x){
      return same(x, -0) ? -0 : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
    },
    // 20.2.2.16 Math.fround(x)
    // TODO
    // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
    // Returns an implementation-dependent approximation of the square root
    // of the sum of squares of its arguments.
    hypot: function(value1, value2){
      var sum    = 0
        , length = arguments.length
        , value;
      while(length--){
        value = +arguments[length];
        if(value == Infinity || value == -Infinity)return Infinity;
        sum += value * value;
      }
      return sqrt(sum);
    },
    // 20.2.2.18 Math.imul(x, y)
    imul: function(x, y){
      var xh = (x >>> 0x10) & 0xffff
        , xl = x & 0xffff
        , yh = (y >>> 0x10) & 0xffff
        , yl = y & 0xffff;
      return xl * yl + (((xh * yl + xl * yh) << 0x10) >>> 0) | 0;
    },
    // 20.2.2.20 Math.log1p(x)
    // Returns an implementation-dependent approximation to the natural logarithm of 1 + x.
    // The result is computed in a way that is accurate even when the value of x is close to zero.
    log1p: function(x){
      return (x > -1e-8 && x < 1e-8) ? (x - x * x / 2) : log(1 + x);
    },
    // 20.2.2.21 Math.log10(x)
    // Returns an implementation-dependent approximation to the base 10 logarithm of x.
    log10: function(x){
      return log(x) / Math.LN10;
    },
    // 20.2.2.22 Math.log2(x)
    // Returns an implementation-dependent approximation to the base 2 logarithm of x.
    log2: function(x){
      return log(x) / Math.LN2;
    },
    // 20.2.2.28 Math.sign(x)
    // Returns the sign of the x, indicating whether x is positive, negative or zero.
    sign: sign,
    // 20.2.2.30 Math.sinh(x)
    // Returns an implementation-dependent approximation to the hyperbolic sine of x.
    sinh: function(x){
      var n = +x;
      return n == -Infinity || n == 0 ? n : (exp(n) - exp(-n)) / 2;
    },
    // 20.2.2.33 Math.tanh(x)
    // Returns an implementation-dependent approximation to the hyperbolic tangent of x.
    tanh: function(x){
      var n = +x;
      return isFinite(n) ? n == 0 ? n : (exp(n) - exp(-n)) / (exp(n) + exp(-n)) : sign(n);
    },
    // 20.2.2.34 Math.trunc(x)
    // Returns the integral part of the number x, removing any fractional digits.
    // If x is already an integer, the result is x.
    trunc: function(x){
      var n = +x;
      return n == 0 ? n : (n > 0 ? floor : ceil)(n);
    }
  });
  // 20.2.1.9 Math [ @@toStringTag ]
  setToStringTag(Math, MATH, true);
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  // TODO
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  // TODO
  $define(PROTO, STRING, {
    // 21.1.3.3 String.prototype.codePointAt(pos)
    // TODO
    // 21.1.3.6 String.prototype.contains(searchString, position = 0)
    contains: function(searchString, position /* = 0 */){
      return !!~String(this).indexOf(searchString, position);
    },
    // 21.1.3.7 String.prototype.endsWith(searchString [, endPosition])
    endsWith: function(searchString, endPosition /* = @length */){
      var length = this.length
        , search = '' + searchString
        , end    = toLength(min(endPosition === undefined ? length : endPosition, length));
      return String(this).slice(end - search.length, end) === search;
    },
    // 21.1.3.13 String.prototype.repeat(count)
    repeat: function(count){
      var n = toInteger(count);
      assert(0 <= n, "Count can't be negative");
      return Array(n + 1).join(this);
    },
    // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
    startsWith: function(searchString, position /* = 0 */){
      var search = '' + searchString
        , index  = toLength(min(position, this.length));
      return String(this).slice(index, index + search.length) === search;
    }
  });
  $define(STATIC, ARRAY, {
    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
    from: function(arrayLike, mapfn /* -> it */, thisArg /* = undefind */){
      var O       = ES5Object(arrayLike)
        , result  = newGeneric(this, Array)
        , mapping = mapfn !== undefined
        , index   = 0
        , length, f;
      if(mapping)f = optionalBind(mapfn, thisArg);
      if($for && isIterable(O))$for(O).of(function(value){
        push.call(result, mapping ? f(value, index++) : value);
      });
      else for(length = toLength(O.length); length > index; index++){
        push.call(result, mapping ? f(O[index], index) : O[index]);
      }
      return result;
    },
    // 22.1.2.3 Array.of( ...items)
    of: function(/*...args*/){
      var index  = 0
        , length = arguments.length
        , result = newGeneric(this, Array);
      while(length > index)push.call(result, arguments[index++]);
      return result;
    }
  });
  function findIndex(predicate, thisArg /* = undefind */){
    var f      = optionalBind(predicate, thisArg)
      , O      = Object(this)
      , self   = ES5Object(O)
      , length = toLength(self.length)
      , index  = 0;
    for(; length > index; index++)if(f(self[index], index, O))return index;
    return -1;
  }
  $define(PROTO, ARRAY, {
    // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
    // TODO
    // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
    fill: function(value, start /* = 0 */, end /* = @length */){
      var length = toLength(this.length)
        , index  = toInteger(start)
        , endPos;
      if(index < 0)index = max(index + length, 0);
      if(end === undefined)endPos = length;
      else {
        endPos = toInteger(end);
        if(endPos < 0)endPos += length;
        endPos = min(endPos, length);
      }
      while(endPos > index)this[index++] = value;
      return this;
    },
    // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
    find: function(predicate, thisArg /* = undefind */){
      var index = findIndex.call(this, predicate, thisArg);
      if(~index)return ES5Object(this)[index];
    },
    // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
    findIndex: findIndex
  });
  // 24.3.3 JSON [ @@toStringTag ]
  setToStringTag(global.JSON, 'JSON', true);
}(isFinite);

/*****************************
 * Module : immediate
 *****************************/

/**
 * setImmediate
 * https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
 * http://nodejs.org/api/timers.html#timers_setimmediate_callback_arg
 * Alternatives:
 * https://github.com/NobleJS/setImmediate
 * https://github.com/calvinmetcalf/immediate
 */
// Node.js 0.9+ & IE10+ has setImmediate, else:
isFunction(setImmediate) && isFunction(clearImmediate) || function(ONREADYSTATECHANGE){
  var postMessage        = global.postMessage
    , addEventListener   = global.addEventListener
    , MessageChannel     = global.MessageChannel
    , counter            = 0
    , queue              = {}
    , defer, channel;
  setImmediate = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    }
    defer(counter);
    return counter;
  }
  clearImmediate = function(id){
    delete queue[id];
  }
  function run(id){
    if(has(queue, id)){
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  }
  function listner(event){
    run(event.data);
  }
  // Node.js 0.8-
  if(isNode){
    defer = function(id){
      process.nextTick(part.call(run, id));
    }
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(addEventListener && isFunction(postMessage) && !global.importScripts){
    defer = function(id){
      postMessage(id, '*');
    }
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel();
    channel.port1.onmessage = listner;
    defer = ctx(channel.port2.postMessage, channel.port2);
  // IE8-
  } else if(document && ONREADYSTATECHANGE in document[CREATE_ELEMENT]('script')){
    defer = function(id){
      var el = document[CREATE_ELEMENT]('script');
      el[ONREADYSTATECHANGE] = function(){
        el.parentNode.removeChild(el);
        run(id);
      }
      document.documentElement.appendChild(el);
    }
  // Rest old browsers
  } else defer = function(id){
    setTimeout(part.call(run, id), 0);
  }
}('onreadystatechange');
$defineTimer(SET_IMMEDIATE, setImmediate);
$defineTimer(CLEAR_IMMEDIATE, clearImmediate);

/*****************************
 * Module : es6_promise
 *****************************/

/**
 * ES6 Promises
 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects
 * https://github.com/domenic/promises-unwrapping
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 * http://caniuse.com/promises
 * Based on:
 * https://github.com/jakearchibald/ES6-Promises
 * Alternatives:
 * https://github.com/getify/native-promise-only
 */
!function(Promise, $Promise){
  isFunction(Promise)
  && isFunction(Promise.resolve) && isFunction(Promise.reject) && isFunction(Promise.all) && isFunction(Promise.race)
  && function(promise){
    return Promise.resolve(promise) === promise;
  }(new Promise(Function()))
  || !function(SUBSCRIBERS, STATE, DETAIL, SEALED, FULFILLED, REJECTED, PENDING){
    // microtask or, if not possible, macrotask
    var asap = isNode
      ? process.nextTick
      : Promise && isFunction(Promise.resolve)
        ? function(fn){ $Promise.resolve().then(fn); }
        : setImmediate;
    // 25.4.3 The Promise Constructor
    Promise = function(executor){
      var promise       = this
        , rejectPromise = part.call(handle, promise, REJECTED);
      assertInstance(promise, Promise, PROMISE);
      assertFunction(executor);
      set(promise, SUBSCRIBERS, []);
      try {
        executor(part.call(resolve, promise), rejectPromise);
      } catch(e){
        rejectPromise(e);
      }
    }
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    hidden(Promise[PROTOTYPE], 'catch', function(onRejected){
      return this.then(undefined, onRejected);
    });
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    hidden(Promise[PROTOTYPE], 'then', function(onFulfilled, onRejected){
      var promise     = this
        , thenPromise = new Promise(Function())
        , args        = [onFulfilled, onRejected]; 
      if(promise[STATE])asap(function(){
        invokeCallback(promise[STATE], thenPromise, args[promise[STATE] - 1], promise[DETAIL]);
      });
      else promise[SUBSCRIBERS].push(thenPromise, onFulfilled, onRejected);
      return thenPromise;
    });
    hidden(Promise[PROTOTYPE], TO_STRING, ES6ToString);
    // 25.4.4.1 Promise.all(iterable)
    hidden(Promise, 'all', function(iterable){
      var C      = this
        , values = [];
      return new C(function(resolve, reject){
        $for(iterable).of(push, values);
        var remaining = values.length
          , results   = Array(remaining);
        if(remaining)forEach.call(values, function(promise, index){
          C.resolve(promise).then(function(value){
            results[index] = value;
            --remaining || resolve(results);
          }, reject);
        });
        else resolve(results);
      });
    });
    // 25.4.4.4 Promise.race(iterable)
    hidden(Promise, 'race', function(iterable){
      var C = this;
      return new C(function(resolve, reject){
        $for(iterable).of(function(promise){
          C.resolve(promise).then(resolve, reject)
        });
      });
    });
    // 25.4.4.5 Promise.reject(r)
    hidden(Promise, 'reject', function(r){
      return new this(function(resolve, reject){
        reject(r);
      });
    });
    // 25.4.4.6 Promise.resolve(x)
    hidden(Promise, 'resolve', function(x){
      return isObject(x) && getPrototypeOf(x) === this[PROTOTYPE] ? x : new this(function(resolve, reject){
        resolve(x);
      });
    });
    function invokeCallback(settled, promise, callback, detail){
      var hasCallback = isFunction(callback)
        , value, succeeded, failed;
      if(hasCallback){
        try {
          value     = callback(detail);
          succeeded = 1;
        } catch(e){
          failed = 1;
          value  = e;
        }
      } else {
        value = detail;
        succeeded = 1;
      }
      if(handleThenable(promise, value))return;
      else if(hasCallback && succeeded)resolve(promise, value);
      else if(failed)handle(promise, REJECTED, value);
      else if(settled == FULFILLED)resolve(promise, value);
      else if(settled == REJECTED)handle(promise, REJECTED, value);
    }
    function handleThenable(promise, value){
      var resolved;
      try {
        assert(promise !== value, "A promises callback can't return that same promise.");
        if(value && isFunction(value.then)){
          value.then(function(val){
            if(resolved)return true;
            resolved = true;
            if(value !== val)resolve(promise, val);
            else handle(promise, FULFILLED, val);
          }, function(val){
            if(resolved)return true;
            resolved = true;
            handle(promise, REJECTED, val);
          });
          return 1;
        }
      } catch(error){
        if(!resolved)handle(promise, REJECTED, error);
        return 1;
      }
    }
    function resolve(promise, value){
      if(promise === value || !handleThenable(promise, value))handle(promise, FULFILLED, value);
    }
    function handle(promise, state, reason){
      if(promise[STATE] === PENDING){
        set(promise, STATE, SEALED);
        set(promise, DETAIL, reason);
        asap(function(){
          promise[STATE] = state;
          for(var subscribers = promise[SUBSCRIBERS], i = 0; i < subscribers.length; i += 3){
            invokeCallback(state, subscribers[i], subscribers[i + state], promise[DETAIL]);
          }
          promise[SUBSCRIBERS] = undefined;
        });
      }
    }
  }(symbol('subscribers'), symbol('state'), symbol('detail'), 0, 1, 2, undefined);
  setToStringTag(Promise, PROMISE);
  $define(GLOBAL, {Promise: Promise}, 1);
}(Promise, Promise);

/*****************************
 * Module : es6_collections
 *****************************/

/**
 * ECMAScript 6 collection polyfill
 * http://people.mozilla.org/~jorendorff/es6-draft.html
 * http://wiki.ecmascript.org/doku.php?id=harmony:simple_maps_and_sets
 * Alternatives:
 * https://github.com/Benvie/harmony-collections
 * https://github.com/eriwen/es6-map-shim
 * https://github.com/EliSnow/Blitz-Collections
 * https://github.com/montagejs/collections
 * https://github.com/Polymer/WeakMap/blob/master/weakmap.js
 */
!function(){
  var KEYS     = COLLECTION_KEYS = symbol('keys')
    , VALUES   = symbol('values')
    , STOREID  = symbol('storeId')
    , WEAKDATA = symbol('weakData')
    , WEAKID   = symbol('weakId')
    , SIZE     = DESCRIPTORS ? symbol('size') : 'size'
    , uid      = 0
    , wid      = 0
    , sizeGetter = {size: {get: function(){
        return this[SIZE];
      }}};
  function initCollection(that, iterable, isSet){
    if(iterable != undefined && $for){
      $for(iterable, !isSet).of(isSet ? that.add : that.set, that);
    }
    return that;
  }
  function createCollectionConstructor(name, isSet){
    function F(iterable){
      assertInstance(this, F, name);
      this.clear();
      initCollection(this, iterable, isSet);
    }
    hidden(F[PROTOTYPE], TO_STRING, ES6ToString);
    return F;
  }
  function fixCollection(Base, name, isSet){
    var tmp          = {}
      , collection   = new Base([isSet ? tmp : [tmp, 1]])
      , initFromIter = collection.has(tmp)
      , key = isSet ? 'add' : 'set'
      , fn;
    // fix .add & .set for chaining
    if(framework && collection[key](tmp, 1) !== collection){
      fn = collection[key];
      hidden(Base[PROTOTYPE], key, function(){
        fn.apply(this, arguments);
        return this;
      });
    }
    if(initFromIter)return wrapGlobalConstructor(Base);
    // wrap to init collections from iterable
    function F(iterable){
      assertInstance(this, F, name);
      return initCollection(new Base, iterable, isSet);
    }
    F[PROTOTYPE] = Base[PROTOTYPE];
    return F;
  }
  
  function fastKey(it, create){
    // return it with 'S' prefix if it's string or with 'P' prefix for over primitives
    if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
    // if it hasn't object id - add next
    if(!has(it, STOREID)){
      if(create)set(it, STOREID, ++uid);
      else return '';
    }
    // return object id with 'O' prefix
    return 'O' + it[STOREID];
  }

  function collectionMethods($VALUES){
    return {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function(){
        set(this, KEYS, create(null));
        if($VALUES == VALUES)set(this, VALUES, create(null));
        set(this, SIZE, 0);
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var index    = fastKey(key)
          , keys     = this[KEYS]
          , contains = index in keys;
        if(contains){
          delete keys[index];
          if($VALUES == VALUES)delete this[VALUES][index];
          this[SIZE]--;
        }
        return contains;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function(callbackfn, thisArg /* = undefined */){
        var f      = optionalBind(callbackfn, thisArg)
          , values = this[$VALUES]
          , keys   = this[KEYS]
          , names  = getKeys(keys)
          , length = names.length
          , i = 0
          , index;
        while(length > i){
          index = names[i++];
          f(values[index], keys[index], this);
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function(key){
        return fastKey(key) in this[KEYS];
      }
    }
  }
  
  // 23.1 Map Objects
  if(!isFunction(Map) || !has(Map[PROTOTYPE], FOR_EACH)){
    SHIM_MAP = true;
    Map = createCollectionConstructor(MAP);
    assign(Map[PROTOTYPE], collectionMethods(VALUES), {
      // 23.1.3.6 Map.prototype.get(key)
      get: function(key){
        return this[VALUES][fastKey(key)];
      },
      // 23.1.3.9 Map.prototype.set(key, value)
      set: function(key, value){
        var index  = fastKey(key, true)
          , values = this[VALUES];
        if(!(index in values)){
          this[KEYS][index] = key;
          this[SIZE]++;
        }
        values[index] = value;
        return this;
      }
    });
    // 23.1.3.10 get Map.prototype.size
    defineProperties(Map[PROTOTYPE], sizeGetter);
  } else Map = fixCollection(Map, MAP);
  
  // 23.2 Set Objects
  if(!isFunction(Set) || !has(Set[PROTOTYPE], FOR_EACH)){
    SHIM_SET = true;
    Set = createCollectionConstructor(SET, true);
    assign(Set[PROTOTYPE], collectionMethods(KEYS), {
      // 23.2.3.1 Set.prototype.add(value)
      add: function(value){
        var index  = fastKey(value, true)
          , values = this[KEYS];
        if(!(index in values)){
          values[index] = value;
          this[SIZE]++;
        }
        return this;
      }
    });
    // 23.2.3.9 get Set.prototype.size
    defineProperties(Set[PROTOTYPE], sizeGetter);
  } else Set = fixCollection(Set, SET, true);
  
  function getWeakData(it){
    has(it, WEAKDATA) || set(it, WEAKDATA, {});
    return it[WEAKDATA];
  }
  function weakCollectionHas(key){
    return isObject(key) && has(key, WEAKDATA) && has(key[WEAKDATA], this[WEAKID]);
  }
  var weakCollectionMethods = {
    // 23.3.3.1 WeakMap.prototype.clear()
    // 23.4.3.2 WeakSet.prototype.clear()
    clear: function(){
      set(this, WEAKID, wid++);
    },
    // 23.3.3.3 WeakMap.prototype.delete(key)
    // 23.4.3.4 WeakSet.prototype.delete(value)
    'delete': function(key){
      return weakCollectionHas.call(this, key) && delete key[WEAKDATA][this[WEAKID]];
    },
    // 23.3.3.5 WeakMap.prototype.has(key)
    // 23.4.3.5 WeakSet.prototype.has(value)
    has: weakCollectionHas
  };
  
  // 23.3 WeakMap Objects
  if(!isFunction(WeakMap) || !has(WeakMap[PROTOTYPE], 'clear')){
    WeakMap = createCollectionConstructor(WEAKMAP);
    assign(WeakMap[PROTOTYPE], assign({
      // 23.3.3.4 WeakMap.prototype.get(key)
      get: function(key){
        return isObject(key) && has(key, WEAKDATA) ? key[WEAKDATA][this[WEAKID]] : undefined;
      },
      // 23.3.3.6 WeakMap.prototype.set(key, value)
      set: function(key, value){
        getWeakData(assertObject(key))[this[WEAKID]] = value;
        return this;
      }
    }, weakCollectionMethods));
  } else WeakMap = fixCollection(WeakMap, WEAKMAP);
  
  // 23.4 WeakSet Objects
  if(!isFunction(WeakSet)){
    WeakSet = createCollectionConstructor(WEAKSET, true);
    assign(WeakSet[PROTOTYPE], assign({
      // 23.4.3.1 WeakSet.prototype.add(value)
      add: function(value){
        getWeakData(assertObject(value))[this[WEAKID]] = true;
        return this;
      }
    }, weakCollectionMethods));
  } else WeakSet = fixCollection(WeakSet, WEAKSET, true);
  
  setToStringTag(Map, MAP);
  setToStringTag(Set, SET);
  setToStringTag(WeakMap, WEAKMAP);
  setToStringTag(WeakSet, WEAKSET);
  
  $define(GLOBAL, {
    Map: Map,
    Set: Set,
    WeakMap: WeakMap,
    WeakSet: WeakSet
  }, true);
}();

/*****************************
 * Module : es6_iterators
 *****************************/

!function($$ITERATOR){
  var FFITERATOR = $$ITERATOR in $Array
    , KEY        = 1
    , VALUE      = 2
    , ITERATED   = symbol('iterated')
    , KIND       = symbol('kind')
    , INDEX      = symbol('index')
    , KEYS       = symbol('keys')
    , ENTRIES    = symbol('entries')
    , returnThis = Function('return this')
    , mapForEach = Map[PROTOTYPE][FOR_EACH]
    , setForEach = Set[PROTOTYPE][FOR_EACH]
    , Iterators  = {};
  
  function createIterResultObject(value, done){
    return {value: value, done: !!done};
  }
  function createIteratorClass(Constructor, NAME, Base, next, DEFAULT){
    Constructor[PROTOTYPE] = {};
    // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
    // 23.1.5.2.1 %MapIteratorPrototype%.next()
    // 23.2.5.2.1 %SetIteratorPrototype%.next()
    hidden(Constructor[PROTOTYPE], 'next', next);
    // 22.1.5.2.2 %ArrayIteratorPrototype%[@@iterator]()
    // 23.1.5.2.2 %MapIteratorPrototype%[@@iterator]()
    // 23.2.5.2.2 %SetIteratorPrototype%[@@iterator]()
    hidden(Constructor[PROTOTYPE], ITERATOR, returnThis);
    // Add iterator for FF iterator protocol
    FFITERATOR && hidden(Constructor[PROTOTYPE], $$ITERATOR, returnThis);
    // 22.1.5.2.3 %ArrayIteratorPrototype%[@@toStringTag]
    // 23.1.5.2.3 %MapIteratorPrototype%[@@toStringTag]
    // 23.2.5.2.3 %SetIteratorPrototype%[@@toStringTag]
    setToStringTag(Constructor, NAME + ' Iterator');
    if(NAME != OBJECT){
      $define(PROTO, NAME, {
        // 22.1.3.4 Array.prototype.entries()
        // 23.1.3.4 Map.prototype.entries()
        // 23.2.3.5 Set.prototype.entries()
        entries: createIteratorFactory(Constructor, KEY+VALUE),
        // 22.1.3.13 Array.prototype.keys()
        // 23.1.3.8 Map.prototype.keys()
        // 23.2.3.8 Set.prototype.keys()
        keys:    createIteratorFactory(Constructor, KEY),
        // 22.1.3.29 Array.prototype.values()
        // 23.1.3.11 Map.prototype.values()
        // 23.2.3.10 Set.prototype.values()
        values:  createIteratorFactory(Constructor, VALUE)
      });
      // 22.1.3.30 Array.prototype[@@iterator]()
      // 23.1.3.12 Map.prototype[@@iterator]()
      // 23.2.3.11 Set.prototype[@@iterator]()
      defineIterator(Base, NAME, createIteratorFactory(Constructor, DEFAULT));
    }
  }
  function createIteratorFactory(Constructor, kind){
    return function(){
      return new Constructor(this, kind);
    }
  }
  function defineIterator(Constructor, NAME, value){
    var proto         = Constructor[PROTOTYPE]
      , has$$ITERATOR = has(proto, $$ITERATOR);
    var iter = has(proto, ITERATOR)
      ? proto[ITERATOR]
      : has$$ITERATOR
        ? proto[$$ITERATOR]
        : value;
    if(framework){
      // Define iterator
      !has(proto, ITERATOR) && hidden(proto, ITERATOR, iter);
      // FF fix
      if(has$$ITERATOR)hidden(getPrototypeOf(iter.call(new Constructor)), ITERATOR, returnThis);
      // Add iterator for FF iterator protocol
      else FFITERATOR && hidden(proto, $$ITERATOR, iter);
    }
    // Plug for library
    Iterators[NAME] = iter;
    // FF & v8 fix
    Iterators[NAME + ' Iterator'] = returnThis;
  }
  
  // 22.1.5.1 CreateArrayIterator Abstract Operation
  function ArrayIterator(iterated, kind){
    set(this, ITERATED, ES5Object(iterated));
    set(this, KIND,     kind);
    set(this, INDEX,    0);
  }
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  createIteratorClass(ArrayIterator, ARRAY, Array, function(){
    var iterated = this[ITERATED]
      , index    = this[INDEX]++
      , kind     = this[KIND];
    if(index >= iterated.length)return createIterResultObject(undefined, 1);
    if(kind == KEY)             return createIterResultObject(index, 0);
    if(kind == VALUE)           return createIterResultObject(iterated[index], 0);
                                return createIterResultObject([index, iterated[index]], 0);
  }, VALUE);
  
  // 21.1.3.27 String.prototype[@@iterator]() - SHAM, TODO
  defineIterator(String, STRING, Iterators[ARRAY]);
  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  Iterators[ARGUMENTS] = Iterators[ARRAY];
  
  // 23.1.5.1 CreateMapIterator Abstract Operation
  function MapIterator(iterated, kind){
    var that = this, keys;
    if(SHIM_MAP)keys = getValues(iterated[COLLECTION_KEYS]);
    else mapForEach.call(iterated, function(val, key){
      this.push(key);
    }, keys = []);
    set(that, ITERATED, iterated);
    set(that, KIND,     kind);
    set(that, INDEX,    0);
    set(that, KEYS,     keys);
  }
  // 23.1.5.2.1 %MapIteratorPrototype%.next()
  createIteratorClass(MapIterator, MAP, Map, function(){
    var that     = this
      , iterated = that[ITERATED]
      , keys     = that[KEYS]
      , index    = that[INDEX]++
      , kind     = that[KIND]
      , key;
    if(index >= keys.length)return createIterResultObject(undefined, 1);
    key = keys[index];
    if(kind == KEY)         return createIterResultObject(key, 0);
    if(kind == VALUE)       return createIterResultObject(iterated.get(key), 0);
                            return createIterResultObject([key, iterated.get(key)], 0);
  }, KEY+VALUE);
  
  // 23.2.5.1 CreateSetIterator Abstract Operation
  function SetIterator(iterated, kind){
    var keys;
    if(SHIM_SET)keys = getValues(iterated[COLLECTION_KEYS]);
    else setForEach.call(iterated, function(val){
      this.push(val);
    }, keys = []);
    set(this, KIND, kind);
    set(this, KEYS, keys.reverse());
  }
  // 23.2.5.2.1 %SetIteratorPrototype%.next()
  createIteratorClass(SetIterator, SET, Set, function(){
    var keys = this[KEYS]
      , key;
    if(!keys.length)           return createIterResultObject(undefined, 1);
    key = keys.pop();
    if(this[KIND] != KEY+VALUE)return createIterResultObject(key, 0);
                               return createIterResultObject([key, key], 0);
  }, VALUE);
  
  function ObjectIterator(iterated, kind){
    set(this, ITERATED, iterated);
    set(this, KEYS,     getKeys(iterated));
    set(this, INDEX,    0);
    set(this, KIND,     kind);
  }
  createIteratorClass(ObjectIterator, OBJECT, Object, function(){
    var that   = this
      , index  = that[INDEX]++
      , object = that[ITERATED]
      , keys   = that[KEYS]
      , kind   = that[KIND]
      , key;
    if(index >= keys.length)return createIterResultObject(undefined, 1);
    key = keys[index];
    if(kind == KEY)         return createIterResultObject(key, 0);
    if(kind == VALUE)       return createIterResultObject(object[key], 0);
                            return createIterResultObject([key, object[key]], 0);
  });
  
  function createObjectIteratorFactory(kind){
    return function(it){
      return new ObjectIterator(it, kind);
    }
  }
  objectIterators = {
    keys:    createObjectIteratorFactory(KEY),
    values:  createObjectIteratorFactory(VALUE),
    entries: createObjectIteratorFactory(KEY+VALUE)
  }
    
  $for = function(iterable, entries){
    if(!(this instanceof $for))return new $for(iterable, entries);
    set(this, ITERATED, iterable);
    set(this, ENTRIES,  entries);
  }
  $for[PROTOTYPE].of = function(fn, that){
    var iterator = getIterator(this[ITERATED])
      , f        = optionalBind(fn, that)
      , entries  = this[ENTRIES]
      , step, value;
    while(!(step = iterator.next()).done){
      value = step.value;
      if((entries ? invoke(f, value) : f(value)) === false)return;
    }
  }
  
  $for.isIterable = isIterable = function(it){
    return (it != undefined && ITERATOR in it) || has(Iterators, classof(it));
  }
  $for.getIterator = getIterator = function(it){
    return assertObject((it[ITERATOR] || Iterators[classof(it)]).call(it));
  }
  
  $define(GLOBAL, {$for: $for});
}('@@iterator');

/*****************************
 * Module : dict
 *****************************/

!function(){
  function Dict(iterable){
    var dict = create(null);
    if(iterable != undefined){
      if(isIterable(iterable))$for(iterable, 1).of(function(key, value){
        dict[key] = value;
      });
      else assign(dict, iterable);
    }
    return dict;
  }
  Dict[PROTOTYPE] = null;
  function findKey(object, fn, that /* = undefined */){
    var f      = optionalBind(fn, that)
      , O      = ES5Object(object)
      , keys   = getKeys(O)
      , length = keys.length
      , i      = 0
      , key;
    while(length > i)if(f(O[key = keys[i++]], key, object))return key;
  }
  assign(Dict, objectIterators, {
    /**
     * Object enumumerabe
     * Alternatives:
     * http://underscorejs.org/ _.{...enumerable}
     * http://sugarjs.com/api/Object/enumerable Object.{...enumerable}
     * http://mootools.net/docs/core/Types/Object Object.{...enumerable}
     * http://api.jquery.com/category/utilities/ $.{...enumerable}
     * http://docs.angularjs.org/api/ng/function angular.{...enumerable}
     */
    every: function(object, fn, that /* = undefined */){
      var f      = optionalBind(fn, that)
        , O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i)if(!f(O[key = keys[i++]], key, object))return false;
      return true;
    },
    filter: function(object, fn, that /* = undefined */){
      var f      = optionalBind(fn, that)
        , O      = ES5Object(object)
        , result = newGeneric(this, Dict)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i){
        if(f(O[key = keys[i++]], key, object))result[key] = O[key];
      }
      return result;
    },
    find: function(object, fn, that /* = undefined */){
      var index = findKey(object, fn, that);
      return index === undefined ? undefined : ES5Object(object)[index];
    },
    findKey: findKey,
    forEach: function(object, fn, that /* = undefined */){
      var f      = optionalBind(fn, that)
        , O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i)f(O[key = keys[i++]], key, object);
    },
    keyOf: keyOf,
    map: function(object, fn, that /* = undefined */){
      var f      = optionalBind(fn, that)
        , O      = ES5Object(object)
        , result = newGeneric(this, Dict)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i)result[key = keys[i++]] = f(O[key], key, object);
      return result;
    },
    reduce: function(object, fn, init /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , memo   = init
        , key;
      if(arguments.length < 3){
        assert(length > i, REDUCE_ERROR);
        memo = O[keys[i++]];
      }
      while(length > i)memo = fn(memo, O[key = keys[i++]], key, object);
      return memo;
    },
    some: function(object, fn, that /* = undefined */){
      var f      = optionalBind(fn, that)
        , O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i)if(f(O[key = keys[i++]], key, object))return true;
      return false;
    },
    turn: function(object, mapfn, target /* = new @ */){
      assertFunction(mapfn);
      var memo   = target == undefined ? newGeneric(this, Dict) : Object(target)
        , O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0
        , key;
      while(length > i){
        if(mapfn(memo, O[key = keys[i++]], key, object) === false)break;
      }
      return memo;
    },
    contains: function(object, searchElement){
      var O      = ES5Object(object)
        , keys   = getKeys(O)
        , length = keys.length
        , i      = 0;
      while(length > i){
        if(sameValueZero(O[keys[i++]], searchElement))return true;
      }
      return false;
    },
    clone: ctx(call, $clone),
    // Has / get / set / delete own property
    has: has,
    get: function(object, key){
      if(has(object, key))return object[key];
    },
    set: function(object, key, value){
      return defineProperty(object, key, descriptor(7, value));
    },
    'delete': function(object, key){
      return has(object, key) && delete object[key];
    },
    isDict: function(it){
      return getPrototypeOf(it) == Dict[PROTOTYPE];
    }
  });
  $define(GLOBAL, {Dict: Dict}, true);
}();

/*****************************
 * Module : function
 *****************************/

$define(STATIC, FUNCTION, {
  isFunction: isFunction,
  isNative: isNative
});
$define(PROTO, FUNCTION, {
  // 7.3.18 Construct (F, argumentsList)
  construct: function(args){
    assertFunction(this);
    var instance = create(this[PROTOTYPE])
      , result   = invoke(this, args, instance);
    return isObject(result) ? result : instance;
  },
  invoke: function(args, that){
    return invoke(this, args, that);
  }
});

/*****************************
 * Module : deferred
 *****************************/

/**
 * Alternatives:
 * http://sugarjs.com/api/Function/delay
 * http://sugarjs.com/api/Function/every
 * http://api.prototypejs.org/language/Function/prototype/delay/
 * http://api.prototypejs.org/language/Function/prototype/defer/
 * http://mootools.net/docs/core/Types/Function#Function:delay
 * http://mootools.net/docs/core/Types/Function#Function:periodical
 */
!function(ARGUMENTS, ID){
  function createDeferredFactory(set, clear){
    function Deferred(args){
      this[ID] = invoke(set, this[ARGUMENTS] = args)
    }
    hidden(Deferred[PROTOTYPE], 'set', function(){
      clear(this[ID]);
      this[ID] = invoke(set, this[ARGUMENTS])
      return this;
    });
    hidden(Deferred[PROTOTYPE], 'clear', function(){
      clear(this[ID]);
      return this;
    });
    return function(/* ...args */){
      assertFunction(this);
      var args = [this], i = 0;
      while(arguments.length > i)args.push(arguments[i++]);
      return new Deferred(args);
    }
  }
  $define(PROTO, FUNCTION, {
    timeout:   createDeferredFactory(setTimeout, clearTimeout),
    interval:  createDeferredFactory(setInterval, clearInterval),
    immediate: createDeferredFactory(setImmediate, clearImmediate)
  });
}(symbol('arguments'), symbol('id'));

/*****************************
 * Module : binding
 *****************************/

!function(_){
  $define(PROTO, FUNCTION, {
    /**
     * Partial apply.
     * Alternatives:
     * http://sugarjs.com/api/Function/fill
     * http://underscorejs.org/#partial
     * http://mootools.net/docs/core/Types/Function#Function:pass
     */
    part: part,
    by: function(that){
      var fn     = this
        , _      = path._
        , holder = false
        , length = arguments.length
        , woctx  = that === _
        , i      = woctx ? 0 : 1
        , indent = i
        , args;
      if(length < 2)return woctx ? ctx(call, fn) : ctx(fn, that);
      args = Array(length - indent);
      while(length > i)if((args[i - indent] = arguments[i++]) === _)holder = true;
      return partial(woctx ? call : fn, args, length, holder, _, true, woctx ? fn : that);
    },
    /**
     * fn(a, b, c, ...) -> a.fn(b, c, ...)
     * Alternatives:
     * http://api.prototypejs.org/language/Function/prototype/methodize/
     */
    methodize: function(){
      var fn = this;
      return function(/*...args*/){
        var args = [this]
          , i    = 0;
        while(arguments.length > i)args.push(arguments[i++]);
        return invoke(fn, args);
      }
    }
  });
  
  /**
   * Alternatives:
   * http://www.2ality.com/2013/06/auto-binding.html
   * http://livescript.net/#property-access -> foo~bar
   * http://lodash.com/docs#bindKey
   */
  function tie(key){
    var that   = this
      , _      = path._
      , holder = false
      , length = arguments.length
      , i = 1, args;
    if(length < 2)return ctx(that[key], that);
    args = Array(length - 1)
    while(length > i)if((args[i - 1] = arguments[i++]) === _)holder = true;
    return partial(that[key], args, length, holder, _, true, that);
  }

  $define(STATIC, OBJECT, {tie: Export.tie = ctx(call, tie)});
  
  hidden(path._, TO_STRING, function(){
    return _;
  });
  DESCRIPTORS && hidden($Object, _, tie);
  hidden($Function, _, tie);
  hidden($Array, _, tie);
  hidden(RegExp[PROTOTYPE], _, tie);
}(uid('tie'));

/*****************************
 * Module : object
 *****************************/

var getPropertyKeys = getSymbols
  ? function(it){
      return getNames(it).concat(getSymbols(it));
    }
  : getNames
// http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
// https://gist.github.com/WebReflection/9353781
function getOwnPropertyDescriptors(object){
  var result = {}
    , keys   = getPropertyKeys(object)
    , length = keys.length
    , i      = 0
    , key;
  while(length > i)result[key = keys[i++]] = getOwnDescriptor(object, key);
  return result;
}
$define(STATIC, OBJECT, {
  isPrototype: ctx(call, $Object.isPrototypeOf),
  getOwnPropertyKeys: getPropertyKeys,
  // http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
  getPropertyDescriptor: function(object, key){
    if(key in object)do {
      if(has(object, key))return getOwnDescriptor(object, key);
    } while(object = getPrototypeOf(object));
  },
  // http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
  // ES7 : http://esdiscuss.org/topic/april-8-2014-meeting-notes#content-1
  getOwnPropertyDescriptors: getOwnPropertyDescriptors,
  /**
   * Shugar for Object.create
   * Alternatives:
   * http://lodash.com/docs#create
   */
  make: function(proto, props){
    return assign(create(proto), props);
  },
  /**
   * 19.1.3.15 Object.mixin ( target, source )
   * Removed in Draft Rev 22, January 20, 2014
   * http://esdiscuss.org/topic/november-19-2013-meeting-notes#content-1
   */
  define: function(target, source){
    return defineProperties(target, getOwnPropertyDescriptors(source));
  },
  // ~ ES7 : http://esdiscuss.org/topic/april-8-2014-meeting-notes#content-1
  values: getValues,
  // ~ ES7 : http://esdiscuss.org/topic/april-8-2014-meeting-notes#content-1
  entries: function(object){
    var O      = ES5Object(object)
      , keys   = getKeys(object)
      , length = keys.length
      , i      = 0
      , result = Array(length)
      , key;
    while(length > i)result[i] = [key = keys[i++], O[key]];
    return result;
  },
  /**
   * Alternatives:
   * http://underscorejs.org/#isObject
   * http://sugarjs.com/api/Object/isType
   * http://docs.angularjs.org/api/angular.isObject
   */
  isObject: isObject,
  /**
   * Alternatives:
   * http://livescript.net/#operators -> typeof!
   * http://mootools.net/docs/core/Core/Core#Core:typeOf
   * http://api.jquery.com/jQuery.type/
   */
  classof: classof
});

/*****************************
 * Module : array
 *****************************/

$define(PROTO, ARRAY, {
  /**
   * Alternatives:
   * http://sugarjs.com/api/Array/at
   * With Proxy: http://www.h3manth.com/new/blog/2013/negative-array-index-in-javascript/
   */
  get: function(index){
    var O      = ES5Object(this)
      , length = toLength(this.length)
      , index  = toInteger(index);
    if(index < 0)index += length;
    return O[index];
  },
  set: function(index, value){
    var length = toLength(this.length)
      , index  = toInteger(index);
    if(index < 0)index += length;
    this[index] = value;
    return this;
  },
  'delete': function(index){
    var length = toLength(this.length)
      , index  = toInteger(index);
    if(index < 0)index += length;
    if(index >= length || index < 0)return false;
    splice.call(this, index, 1);
    return true;
  },
  // ~ ES7 : https://github.com/domenic/Array.prototype.contains
  contains: function(searchElement, fromIndex){
    var O      = ES5Object(this)
      , length = toLength(O.length)
      , index  = toInteger(fromIndex);
    if(index < 0)index += length;
    while(length > index)if(sameValueZero(searchElement, O[index++]))return true;
    return false;
  },
  clone: $clone,
  /**
   * Alternatives:
   * http://lodash.com/docs#transform
   */
  turn: turn
});

/*****************************
 * Module : array_statics
 *****************************/

/**
 * Array static methods
 * Strawman: http://wiki.ecmascript.org/doku.php?id=strawman:array_statics
 * JavaScript 1.6: https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/1.6#Array_and_String_generics
 */
$define(STATIC, ARRAY, turn.call(
  // IE... getNames($Array),
  array(
    // ES3:
    'concat,join,pop,push,reverse,shift,slice,sort,splice,unshift,' +
    // ES5:
    'indexOf,lastIndexOf,every,some,forEach,map,filter,reduce,reduceRight,' +
    // ES6:
    'fill,find,findIndex,keys,values,entries,' +
    // Core.js:
    'get,set,delete,contains,clone,turn'
  ),
  function(memo, key){
    if(key in $Array)memo[key] = ctx(call, $Array[key]);
  }, {}
));

/*****************************
 * Module : number
 *****************************/

$define(STATIC, NUMBER, {toInteger: toInteger});
$define(PROTO, NUMBER, {
  /**
   * Invoke function @ times and return array of results
   * Alternatives:
   * http://underscorejs.org/#times
   * http://sugarjs.com/api/Number/times
   * http://api.prototypejs.org/language/Number/prototype/times/
   * http://mootools.net/docs/core/Types/Number#Number:times
   */
  times: function(mapfn /* = -> it */, thisArg /* = undefined */){
    var number = +this
      , length = toLength(number)
      , result = Array(length)
      , i      = 0
      , f;
    if(isFunction(mapfn)){
      f = optionalBind(mapfn, thisArg);
      while(length > i)result[i] = f(i, i++, number);
    } else while(length > i)result[i] = i++;
    return result;
  },
  random: function(number /* = 0 */){
    var a = +this   || 0
      , b = +number || 0
      , m = min(a, b);
    return random() * (max(a, b) - m) + m;
  }
});
$define(STATIC, MATH, {
  /**
   * Alternatives:
   * http://underscorejs.org/#random
   * http://mootools.net/docs/core/Types/Number#Number:Number-random
   */
  randomInt: function(a /* = 0 */, b /* = 0 */){
    var x = toInteger(a)
      , y = toInteger(b)
      , m = min(x, y);
    return floor(random() * (max(x, y) + 1 - m) + m);
  }
});
/**
 * Math functions in Number.prototype
 * Alternatives:
 * http://sugarjs.com/api/Number/math
 * http://mootools.net/docs/core/Types/Number#Number-Math
 */
$define(PROTO, NUMBER, turn.call(
  // IE... getNames(Math)
  array(
    // ES3
    'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,sqrt,max,min,pow,atan2,' +
    // ES6
    'acosh,asinh,atanh,cbrt,clz32,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc,' +
    // Core.js
    'randomInt'
  ),
  function(memo, key){
    if(key in Math)memo[key] = function(fn){
      return function(/*...args*/){
        // ie8- convert `this` to object -> convert it to number
        var args = [+this]
          , i    = 0;
        while(arguments.length > i)args.push(arguments[i++]);
        return invoke(fn, args);
      }
    }(Math[key])
  }, {}
));

/*****************************
 * Module : string
 *****************************/

!function(){
  var escapeHTMLDict = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;'
      }
    , unescapeHTMLDict = turn.call(getKeys(escapeHTMLDict), function(memo, key){
        memo[escapeHTMLDict[key]] = key;
      }, {})
    , escapeHTMLRegExp   = /[&<>"']/g
    , unescapeHTMLRegExp = /&(?:amp|lt|gt|quot|apos);/g;
  $define(PROTO, STRING, {
    /**
     * Alternatives:
     * http://underscorejs.org/#escape
     * http://sugarjs.com/api/String/escapeHTML
     * http://api.prototypejs.org/language/String/prototype/escapeHTML/
     */
    escapeHTML: function(){
      return String(this).replace(escapeHTMLRegExp, function(part){
        return escapeHTMLDict[part];
      });
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#unescape
     * http://sugarjs.com/api/String/unescapeHTML
     * http://api.prototypejs.org/language/String/prototype/unescapeHTML/
     */
    unescapeHTML: function(){
      return String(this).replace(unescapeHTMLRegExp, function(part){
        return unescapeHTMLDict[part];
      });
    }
  });
}();

/*****************************
 * Module : regexp
 *****************************/

!function(escapeRegExp){
  /**
   * ~ES7 : https://gist.github.com/kangax/9698100
   * Alternatives:
   * http://sugarjs.com/api/String/escapeRegExp
   * http://api.prototypejs.org/language/RegExp/escape/
   * http://mootools.net/docs/core/Types/String#String:escapeRegExp
   */
  $define(STATIC, REGEXP, {
    escape: function(it){
      return String(it).replace(escapeRegExp, '\\$1');
    }
  });
}(/([\\\-[\]{}()*+?.,^$|])/g);

/*****************************
 * Module : date
 *****************************/

!function(formatRegExp, flexioRegExp, locales, current, SECONDS, MINUTES, HOURS, DATE, MONTH, YEAR){
  function createFormat(UTC){
    return function(template, locale /* = current */){
      var that = this
        , dict = locales[has(locales, locale) ? locale : current];
      function get(unit){
        return that[(UTC ? 'getUTC' : 'get') + unit]();
      }
      return String(template).replace(formatRegExp, function(part){
        switch(part){
          case 'ms'   : var ms = get('Milliseconds');                           // Milliseconds : 000-999
            return ms > 99 ? ms : '0' + lz(ms);
          case 's'    : return get(SECONDS);                                    // Seconds      : 0-59
          case 'ss'   : return lz(get(SECONDS));                                // Seconds      : 00-59
          case 'm'    : return get(MINUTES);                                    // Minutes      : 0-59
          case 'mm'   : return lz(get(MINUTES));                                // Minutes      : 00-59
          case 'h'    : return get(HOURS);                                      // Hours        : 0-23
          case 'hh'   : return lz(get(HOURS));                                  // Hours        : 00-23
          case 'D'    : return get(DATE)                                        // Date         : 1-31
          case 'DD'   : return lz(get(DATE));                                   // Date         : 01-31
          case 'W'    : return dict.W[get('Day')];                              // Day          : Понедельник
          case 'N'    : return get(MONTH) + 1;                                  // Month        : 1-12
          case 'NN'   : return lz(get(MONTH) + 1);                              // Month        : 01-12
          case 'M'    : return dict.M[get(MONTH)];                              // Month        : Январь
          case 'MM'   : return dict.MM[get(MONTH)];                             // Month        : Января
          case 'YY'   : return lz(get(YEAR) % 100);                             // Year         : 14
          case 'YYYY' : return get(YEAR);                                       // Year         : 2014
        } return part;
      });
    }
  }
  function lz(num){
    return num > 9 ? num : '0' + num;
  }
  function addLocale(lang, locale){
    function split(index){
      return turn.call(array(locale.months), function(memo, it){
        memo.push(it.replace(flexioRegExp, '$' + index));
      });
    }
    locales[lang] = {
      W : array(locale.weekdays),
      MM: split(1),
      M : split(2)
    };
    return Date;
  }
  $define(STATIC, DATE, {
    locale: function(locale){
      return has(locales, locale) ? current = locale : current;
    },
    addLocale: addLocale
  });
  $define(PROTO, DATE, {
    format:    createFormat(false),
    formatUTC: createFormat(true)
  });
  addLocale(current, {
    weekdays: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
    months:   'January,February,March,April,May,June,July,August,September,October,November,December'
  });
  addLocale('ru', {
    weekdays: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
    months:   'Январ:я|ь,Феврал:я|ь,Март:а|,Апрел:я|ь,Ма:я|й,Июн:я|ь,Июл:я|ь,Август:а|,Сентябр:я|ь,Октябр:я|ь,Ноябр:я|ь,Декабр:я|ь'
  });
}(/\b\w{1,4}\b/g, /:(.*)\|(.*)$/, {}, 'en', 'Seconds', 'Minutes', 'Hours', 'Date', 'Month', 'FullYear');

/*****************************
 * Module : console
 *****************************/

/**
 * https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
 * https://developer.mozilla.org/en-US/docs/Web/API/console
 */
!function(console){
  var $console = turn.call(
    array('assert,count,clear,debug,dir,dirxml,error,exception,' +
      'group,groupCollapsed,groupEnd,info,log,table,trace,warn,' +
      'markTimeline,profile,profileEnd,time,timeEnd,timeStamp'),
    function(memo, key){
      var fn = console[key];
      memo[key] = function(){
        if(enabled && fn)return apply.call(fn, console, arguments);
      };
    },
    {
      enable: function(){
        enabled = true;
      },
      disable: function(){
        enabled = false;
      }
    }
  ), enabled = true;
  try {
    framework && delete global.console;
  } catch(e){}
  $define(GLOBAL, {console: assign($console.log, $console)}, true);
}(global.console || {});
}(typeof window != 'undefined' ? window : global, true);