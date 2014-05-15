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

// Shortcuts for property names
var OBJECT         = 'Object'
  , FUNCTION       = 'Function'
  , ARRAY          = 'Array'
  , STRING         = 'String'
  , NUMBER         = 'Number'
  , REGEXP         = 'RegExp'
  , MAP            = 'Map'
  , SET            = 'Set'
  , WEAKMAP        = 'WeakMap'
  , WEAKSET        = 'WeakSet'
  , PROMISE        = 'Promise'
  , ARGUMENTS      = 'Arguments'
  , PROCESS        = 'process'
  , PROTOTYPE      = 'prototype'
  , CONSTRUCTOR    = 'constructor'
  , CREATE_ELEMENT = 'createElement'
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
  , Promise        = global[PROMISE]
  , Math           = global.Math
  , TypeError      = global.TypeError
  , setTimeout     = global.setTimeout
  , clearTimeout   = global.clearTimeout
  , setInterval    = global.setInterval
  , setImmediate   = global.setImmediate
  , clearImmediate = global.clearImmediate
  , process        = global[PROCESS]
  , document       = global.document
  , Infinity       = 1 / 0
  , $Array         = Array[PROTOTYPE]
  , $Object        = Object[PROTOTYPE]
  , $Function      = Function[PROTOTYPE]
  , Export         = {};
  
// 7.2.3 SameValue(x, y)
var same = Object.is || function(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
}
// 7.2.4 SameValueZero(x, y)
function same0(x, y){
  return x === y || (x !== x && y !== y);
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
var toString = $Object.toString
  , TOSTRINGTAG;
function setTag(constructor, tag, stat){
  if(TOSTRINGTAG && constructor)(stat ? constructor : constructor[PROTOTYPE])[TOSTRINGTAG] = tag;
}
// object internal [[Class]]
function classof(it){
  if(it == undefined)return it === undefined ? 'Undefined' : 'Null';
  var cof = toString.call(it).slice(8, -1);
  return TOSTRINGTAG && cof == OBJECT && it[TOSTRINGTAG] ? it[TOSTRINGTAG] : cof;
}

// Function:
var apply = $Function.apply
  , call  = $Function.call
  , path  = framework ? global : Export;
Export._ = path._ = path._ || {};
// partial apply
function part(/*...args*/){
  var length = arguments.length
    , args   = Array(length)
    , i      = 0
    , _      = path._
    , placeholder = false;
  while(length > i)if((args[i] = arguments[i++]) === _)placeholder = true;
  return createPartialApplication(this, args, length, placeholder, _, false);
}
function ctx(fn, that){
  assertFunction(fn);
  return function(/*...args*/){
    return fn.apply(that, arguments);
  }
}
function createPartialApplication(fn, argsPart, lengthPart, placeholder, _, bind, context){
  assertFunction(fn);
  return function(/*...args*/){
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
// 19.1.2.1 Object.assign ( target, source, ... )
var assign = Object.assign || function(target, source){
  target = Object(target);
  var agsLength = arguments.length
    , i         = 1;
  while(agsLength > i){
    source = ES5Object(arguments[i++]);
    var props  = keys(source)
      , length = props.length
      , j      = 0
      , key;
    while(length > j)target[key = props[j++]] = source[key];
  }
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
  , $indexOf = Array.indexOf || unbind($Array.indexOf)
  , $forEach = Array.forEach || unbind($Array.forEach)
  , $slice   = Array.slice || function(arrayLike, from){
      return slice.call(arrayLike, from);
    }
// simple reduce to object
function transform(mapfn, target /* = [] */){
  assertFunction(mapfn);
  target = target == undefined ? [] : Object(target);
  var self   = ES5Object(this)
    , length = toLength(self.length)
    , i      = 0;
  for(;length > i; i++)if(i in self && mapfn(target, self[i], i, this) === false)break;
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
    , exports  = isGlobal ? Export : Export[name] || (Export[name] = {});
  if(isGlobal){
    forced = source;
    source = name;
  }
  for(key in source)if(has(source, key)){
    own  = !forced && target && has(target, key) && (!isFunction(target[key]) || isNative(target[key]));
    prop = own ? target[key] : source[key];
    // export to `C`
    exports[key] = isProto && isFunction(prop) ? unbind(prop) : prop;
    // if build as framework, extend global objects
    framework && target && !own && (isGlobal || delete target[key])
      && defineProperty(target, key, descriptor(6 + !isProto, source[key]));
  }
}
function $defineTimer(key, fn){
  if(framework)global[key] = fn;
  Export[key] = global[key] != fn ? fn : ctx(fn, global);
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
// export
var isNode = classof(process) == PROCESS;
if(isNode)module.exports = Export;
if(!isNode || framework)global.C = Export;

/*****************************
 * Module : es6_symbol
 *****************************/

/**
 * ECMAScript 6 Symbol
 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-symbol-objects
 * Alternatives:
 * http://webreflection.blogspot.com.au/2013/03/simulating-es6-symbols-in-es5.html
 * https://github.com/seanmonstar/symbol
 */
!function(Symbol, SYMBOL, TAG, SymbolRegistry, FFITERATOR){
  // 19.4.1 The Symbol Constructor
  if(!isNative(Symbol)){
    Symbol = function(description){
      if(!(this instanceof Symbol))return new Symbol(description);
      var tag = symbol(description);
      defineProperty($Object, tag, {
        set: function(value){
          hidden(this, tag, value);
        }
      });
      hidden(this, TAG, tag);
    }
    Symbol[PROTOTYPE].toString = Symbol[PROTOTYPE].valueOf = function(){
      return this[TAG];
    }
  }
  $define(GLOBAL, {Symbol: wrapGlobalConstructor(Symbol)}, 1);
  $define(STATIC, SYMBOL, {
    // 19.4.2.2 Symbol.for(key)
    'for': function(key){
      return has(SymbolRegistry, key) ? SymbolRegistry[key] : SymbolRegistry[key] = Symbol(key);
    },
    // 19.4.2.6 Symbol.iterator
    iterator: ITERATOR = Symbol.iterator || FFITERATOR in $Array ? FFITERATOR : Symbol(SYMBOL + '.iterator'),
    // 19.4.2.7 Symbol.keyFor(sym)
    keyFor: function(sym){
      for(var key in SymbolRegistry)if(SymbolRegistry[key] === sym)return key;
    },
    // 19.4.2.10 Symbol.toStringTag
    toStringTag: TOSTRINGTAG = Symbol.toStringTag || Symbol(SYMBOL + '.toStringTag')
  });
  setTag(Symbol, SYMBOL);
}(global.Symbol, 'Symbol', symbol('tag'), {}, '@@iterator');

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
 * https://github.com/inexorabletash/polyfill/blob/master/harmony.js
 */
!function(isFinite){
  function sign(it){
    return (it = +it) == 0 || it != it ? it : it < 0 ? -1 : 1;
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
  __PROTO__ && (function(set, buggy){
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
  })(unbind(getOwnPropertyDescriptor($Object, '__proto__').set));
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
    return !isFinite(x = +x) || x === 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
  }
  $define(STATIC, 'Math', {
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
      return x === 0 ? x : 0.5 * log((1 + x) / (1 - x));
    },
    // 20.2.2.9 Math.cbrt(x)
    // Returns an implementation-dependent approximation to the cube root of x.
    cbrt: function(x){
      return sign(x) * pow(abs(x), 1/3);
    },
    // 20.2.2.11 Math.clz32 (x)
    clz32: function(x){
      x = x >>> 0;
      return x ? 32 - x.toString(2).length : 32;
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
    // fround: function(x){ TODO },
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
      return ((x = +x) == -Infinity) || x == 0 ? x : (exp(x) - exp(-x)) / 2;
    },
    // 20.2.2.33 Math.tanh(x)
    // Returns an implementation-dependent approximation to the hyperbolic tangent of x.
    tanh: function(x){
      return isFinite(x = +x) ? x == 0 ? x : (exp(x) - exp(-x)) / (exp(x) + exp(-x)) : sign(x);
    },
    // 20.2.2.34 Math.trunc(x)
    // Returns the integral part of the number x, removing any fractional digits.
    // If x is already an integer, the result is x.
    trunc: function(x){
      return (x = +x) == 0 ? x : (x > 0 ? floor : ceil)(x);
    }
  });
  // 20.2.1.9 Math [ @@toStringTag ]
  setTag(Math, 'Math', 1);
  /**
    $define(STATIC, STRING, {
      // 21.1.2.2 String.fromCodePoint(...codePoints)
      // fromCodePoint: function(){ TODO },
      // 21.1.2.4 String.raw(callSite, ...substitutions)
      raw: function(){ TODO }
    });
    */
  $define(PROTO, STRING, {
    // 21.1.3.3 String.prototype.codePointAt(pos)
    // codePointAt: function(pos /* = 0 * /){ TODO },
    // 21.1.3.6 String.prototype.contains(searchString, position = 0)
    contains: function(searchString, position /* = 0 */){
      return !!~String(this).indexOf(searchString, position);
    },
    // 21.1.3.7 String.prototype.endsWith(searchString [, endPosition])
    endsWith: function(searchString, endPosition /* = @length */){
      var length = this.length;
      searchString += '';
      endPosition = toLength(min(endPosition === undefined ? length : endPosition, length));
      return String(this).slice(endPosition - searchString.length, endPosition) === searchString;
    },
    // 21.1.3.13 String.prototype.repeat(count)
    repeat: function(count){
      assert(0 <= (count |= 0), "Count can't be negative");
      return Array(count + 1).join(this);
    },
    // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
    startsWith: function(searchString, position /* = 0 */){
      searchString += '';
      position = toLength(min(position, this.length));
      return String(this).slice(position, position + searchString.length) === searchString;
    }
  });
  $define(STATIC, ARRAY, {
    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
    from: function(arrayLike, mapfn /* -> it */, thisArg /* = undefind */){
      if(mapfn !== undefined)assertFunction(mapfn);
      var O      = ES5Object(arrayLike)
        , result = new (isFunction(this) ? this : Array)
        , i = 0, length, iter, step;
      if(isIterable && isIterable(O)){
        iter = getIterator(O);
        while(!(step = iter.next()).done)push.call(result, mapfn ? mapfn.call(thisArg, step.value, i++) : step.value);
      } else for(length = toLength(O.length); i < length; i++)push.call(result, mapfn ? mapfn.call(thisArg, O[i], i) : O[i]);
      return result;
    },
    // 22.1.2.3 Array.of( ...items)
    of: function(/*...args*/){
      var i = 0, length = arguments.length
        , result = new (isFunction(this) ? this : Array);
      while(i < length)push.call(result, arguments[i++]);
      return result;
    }
  });
  function findIndex(predicate, thisArg /* = undefind */){
    assertFunction(predicate);
    var O      = Object(this)
      , self   = ES5Object(O)
      , length = toLength(self.length)
      , i = 0;
    for(; i < length; i++){
      if(i in self && predicate.call(thisArg, self[i], i, O))return i;
    }
    return -1;
  }
  $define(PROTO, ARRAY, {
    // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
    // copyWithin: function(target, start, end){ TODO },
    // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
    fill: function(value, start /* = 0 */, end /* = @length */){
      var length = toLength(this.length);
      start = toInteger(start);
      if(0 > start)start = length + start;
      end = end == undefined ? length : toInteger(end);
      while(end > start)this[start++] = value;
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
  setTag(global.JSON, 'JSON', 1);
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
isFunction(setImmediate) && isFunction(clearImmediate) || !function(postMessage, MessageChannel,
    ONREADYSTATECHANGE, IMMEDIATE_PREFIX, counter, queue, defer, channel){
  setImmediate = function(fn){
    var id   = IMMEDIATE_PREFIX + ++counter
      , args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[id] = function(){
      (isFunction(fn) ? fn : Function(fn)).apply(undefined, args);
    }
    defer(id);
    return counter;
  }
  clearImmediate = function(id){
    delete queue[IMMEDIATE_PREFIX + id];
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
  } else if(isFunction(postMessage) && !global.importScripts){
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
  } else {
    defer = function(id){
      setTimeout(part.call(run, id), 0);
    }
  }
}(global.postMessage, global.MessageChannel, 'onreadystatechange', symbol('immediate'), 0, {});
$defineTimer('setImmediate', setImmediate);
$defineTimer('clearImmediate', clearImmediate);

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
 * https://github.com/paulmillr/es6-shim
 */
!function(Promise, $Promise){
  isFunction(Promise)
  && isFunction(Promise.resolve) && isFunction(Promise.reject) && isFunction(Promise.all) && isFunction(Promise.race)
  && (function(promise){
    return Promise.resolve(promise) === promise;
  })(new Promise(Function()))
  || !function(SUBSCRIBERS, STATE, DETAIL, SEALED, FULFILLED, REJECTED, PENDING){
    // microtask or, if not possible, macrotask
    var asap =
      isNode ? process.nextTick :
      Promise && isFunction(Promise.resolve) ? function(fn){ $Promise.resolve().then(fn); } :
      setImmediate;
    // 25.4.3 The Promise Constructor
    Promise = function(executor){
      var promise       = this
        , rejectPromise = part.call(handle, promise, REJECTED);
      assertInstance(promise, Promise, PROMISE);
      assertFunction(executor);
      promise[SUBSCRIBERS] = [];
      try {
        executor(part.call(resolve, promise), rejectPromise);
      } catch(e){
        rejectPromise(e);
      }
    }
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    Promise[PROTOTYPE]['catch'] = function(onRejected){
      return this.then(undefined, onRejected);
    },
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    Promise[PROTOTYPE].then = function(onFulfilled, onRejected){
      var promise     = this
        , thenPromise = new Promise(Function())
        , args        = [onFulfilled, onRejected]; 
      if(promise[STATE])asap(function(){
        invokeCallback(promise[STATE], thenPromise, args[promise[STATE] - 1], promise[DETAIL]);
      });
      else promise[SUBSCRIBERS].push(thenPromise, onFulfilled, onRejected);
      return thenPromise;
    }
    // 25.4.4.1 Promise.all(iterable)
    Promise.all = function(iterable){
      var C      = this
        , values = [];
      return new C(function(resolve, reject){
        forOf(iterable, push, values);
        var remaining = values.length
          , results   = Array(remaining);
        if(remaining)$forEach(values, function(promise, index){
          C.resolve(promise).then(function(value){
            results[index] = value;
            --remaining || resolve(results);
          }, reject);
        });
        else resolve(results);
      });
    }
    // 25.4.4.4 Promise.race(iterable)
    Promise.race = function(iterable){
      var C = this;
      return new C(function(resolve, reject){
        forOf(iterable, function(promise){
          C.resolve(promise).then(resolve, reject)
        });
      });
    }
    // 25.4.4.5 Promise.reject(r)
    Promise.reject = function(r){
      return new this(function(resolve, reject){
        reject(r);
      });
    }
    // 25.4.4.6 Promise.resolve(x)
    Promise.resolve = function(x){
      return isObject(x) && getPrototypeOf(x) === this[PROTOTYPE] ? x : new this(function(resolve, reject){
        resolve(x);
      });
    }
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
        promise[STATE]  = SEALED;
        promise[DETAIL] = reason;
        asap(function(){
          promise[STATE] = state;
          for(var subscribers = promise[SUBSCRIBERS], i = 0; i < subscribers.length; i += 3){
            invokeCallback(state, subscribers[i], subscribers[i + state], promise[DETAIL]);
          }
          promise[SUBSCRIBERS] = undefined;
        });
      }
    }
  }(symbol('subscribers'), symbol('state'), symbol('detail'), 0, 1, 2);
  setTag(Promise, PROMISE)
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
 * https://github.com/paulmillr/es6-shim
 * https://github.com/monolithed/ECMAScript-6
 * https://github.com/Benvie/harmony-collections
 * https://github.com/eriwen/es6-map-shim
 * https://github.com/EliSnow/Blitz-Collections
 * https://github.com/montagejs/collections
 * https://github.com/Polymer/WeakMap/blob/master/weakmap.js
 */
!function(){
  var STOREID  = symbol('storeid')
    , KEYS     = symbol('keys')
    , VALUES   = symbol('values')
    , WEAKDATA = symbol('weakdata')
    , WEAKID   = symbol('weakid')
    , SIZE     = DESCRIPTORS ? symbol('size') : 'size'
    , uid = 0
    , wid = 0
    , tmp = {}
    , sizeGetter = {size: {get: function(){
        return this[SIZE];
      }}};
  function initCollection(that, iterable, isSet){
    if(iterable != undefined)forOf && forOf(iterable, isSet ? that.add : that.set, that, !isSet);
    return that;
  }
  function createCollectionConstructor(name, isSet){
    function F(iterable){
      assertInstance(this, F, name);
      this.clear();
      initCollection(this, iterable, isSet);
    }
    return F;
  }
  function fixCollection(Base, name, isSet){
    var collection   = new Base([isSet ? tmp : [tmp, 1]])
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
    return isObject(it)
      ? 'O' + (has(it, STOREID)
        ? it[STOREID]
        : create ? defineProperty(it, STOREID, {value: uid++})[STOREID] : '')
      : (typeof it == 'string' ? 'S' : 'P') + it;
  }
  function createForEach(key){
    return function(callbackfn, thisArg /* = undefined */){
      assertFunction(callbackfn);
      var values = this[VALUES]
        , keyz   = this[key]
        , names  = keys(keyz)
        , length = names.length
        , i = 0
        , index;
      while(length > i){
        index = names[i++];
        callbackfn.call(thisArg, values[index], keyz[index], this);
      }
    }
  }
  function collectionHas(key){
    return fastKey(key) in this[VALUES];
  }
  function clearSet(){
    hidden(this, VALUES, create(null));
    hidden(this, SIZE, 0);
  }
  
  // 23.1 Map Objects
  if(!isFunction(Map) || !has(Map[PROTOTYPE], 'forEach')){
    Map = createCollectionConstructor(MAP);
    assign(Map[PROTOTYPE], {
      // 23.1.3.1 Map.prototype.clear()
      clear: function(){
        hidden(this, KEYS, create(null));
        clearSet.call(this);
      },
      // 23.1.3.3 Map.prototype.delete(key)
      'delete': function(key){
        var index    = fastKey(key)
          , values   = this[VALUES]
          , contains = index in values;
        if(contains){
          delete this[KEYS][index];
          delete values[index];
          this[SIZE]--;
        }
        return contains;
      },
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: createForEach(KEYS),
      // 23.1.3.6 Map.prototype.get(key)
      get: function(key){
        return this[VALUES][fastKey(key)];
      },
      // 23.1.3.7 Map.prototype.has(key)
      has: collectionHas,
      // 23.1.3.9 Map.prototype.set(key, value)
      set: function(key, value){
        var index  = fastKey(key, 1)
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
  if(!isFunction(Set) || !has(Set[PROTOTYPE], 'forEach')){
    Set = createCollectionConstructor(SET, 1);
    assign(Set[PROTOTYPE], {
      // 23.2.3.1 Set.prototype.add(value)
      add: function(value){
        var index  = fastKey(value, 1)
          , values = this[VALUES];
        if(!(index in values)){
          values[index] = value;
          this[SIZE]++;
        }
        return this;
      },
      // 23.2.3.2 Set.prototype.clear()
      clear: clearSet,
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(value){
        var index    = fastKey(value)
          , values   = this[VALUES]
          , contains = index in values;
        if(contains){
          delete values[index];
          this[SIZE]--;
        }
        return contains;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: createForEach(VALUES),
      // 23.2.3.7 Set.prototype.has(value)
      has: collectionHas
    });
    // 23.2.3.9 get Set.prototype.size
    defineProperties(Set[PROTOTYPE], sizeGetter);
  } else Set = fixCollection(Set, SET, 1);
  
  function getWeakData(it){
    return (has(it, WEAKDATA) ? it : defineProperty(it, WEAKDATA, {value: {}}))[WEAKDATA];
  }
  var weakCollectionMethods = {
    // 23.3.3.1 WeakMap.prototype.clear()
    // 23.4.3.2 WeakSet.prototype.clear()
    clear: function(){
      hidden(this, WEAKID, wid++);
    },
    // 23.3.3.3 WeakMap.prototype.delete(key)
    // 23.4.3.4 WeakSet.prototype.delete(value)
    'delete': function(key){
      return this.has(key) && delete key[WEAKDATA][this[WEAKID]];
    },
    // 23.3.3.5 WeakMap.prototype.has(key)
    // 23.4.3.5 WeakSet.prototype.has(value)
    has: function(key){
      return isObject(key) && has(key, WEAKDATA) && has(key[WEAKDATA], this[WEAKID]);
    }
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
        assertObject(key);
        getWeakData(key)[this[WEAKID]] = value;
        return this;
      }
    }, weakCollectionMethods));
  } else WeakMap = fixCollection(WeakMap, WEAKMAP);
  
  // 23.4 WeakSet Objects
  if(!isFunction(WeakSet)){
    WeakSet = createCollectionConstructor(WEAKSET, 1);
    assign(WeakSet[PROTOTYPE], assign({
      // 23.4.3.1 WeakSet.prototype.add(value)
      add: function(value){
        assertObject(value);
        getWeakData(value)[this[WEAKID]] = true;
        return this;
      }
    }, weakCollectionMethods));
  } else WeakSet = fixCollection(WeakSet, WEAKSET, 1);
  
  setTag(Map, MAP);
  setTag(Set, SET);
  setTag(WeakMap, WEAKMAP);
  setTag(WeakSet, WEAKSET);
    
  $define(GLOBAL, {
    Map: Map,
    Set: Set,
    WeakMap: WeakMap,
    WeakSet: WeakSet
  }, 1);
}();

/*****************************
 * Module : es6_iterators
 *****************************/

!function($ITERATOR, KEY, VALUE, ITERATED, KIND, INDEX, KEYS, returnThis){
  function createIterResultObject(value, done){
    return {value: value, done: !!done};
  }
  function createIteratorFactory(constructor, kind){
    return function(){
      return new constructor(this, kind);
    }
  }
  
  function ArrayIterator(iterated, kind){
    this[ITERATED] = ES5Object(iterated);
    this[KIND]     = kind;
    this[INDEX]    = 0;
  }
  ArrayIterator[PROTOTYPE] = {
    next: function(){
      var that     = this
        , iterated = that[ITERATED]
        , index    = that[INDEX]++;
      if(index >= iterated.length)return createIterResultObject(undefined, 1);
      switch(that[KIND]){
        case KEY   : return createIterResultObject(index, 0);
        case VALUE : return createIterResultObject(iterated[index], 0);
      }
      return createIterResultObject([index, iterated[index]], 0);
    }
  };
  
  function MapIterator(iterated, kind){
    this[ITERATED] = iterated;
    this[KIND]     = kind;
    this[INDEX]    = 0;
    iterated.forEach(function(val, key){
      this.push(key);
    }, this[KEYS] = []);
  }
  MapIterator[PROTOTYPE] = {
    next: function(){
      var iterated = this[ITERATED]
        , keys     = this[KEYS]
        , index    = this[INDEX]++
        , key;
      if(index >= keys.length)return createIterResultObject(undefined, 1);
      key = keys[index];
      switch(this[KIND]){
        case KEY   : return createIterResultObject(key, 0);
        case VALUE : return createIterResultObject(iterated.get(key), 0);
      }
      return createIterResultObject([key, iterated.get(key)], 0);
    }
  };
  
  function SetIterator(iterated, kind){
    this[KIND]  = kind;
    this[INDEX] = 0;
    iterated.forEach(function(val){
      this.push(val);
    }, this[KEYS] = []);
  }
  SetIterator[PROTOTYPE] = {
    next: function(){
      var keys  = this[KEYS]
        , index = this[INDEX]++
        , key;
      if(index >= keys.length)return createIterResultObject(undefined, 1);
      key = keys[index];
      if(this[KIND] == VALUE)return createIterResultObject(key, 0);
      return createIterResultObject([key, key], 0);
    }
  };
  
  function ObjectIterator(iterated, kind){
    this[ITERATED] = iterated;
    this[KEYS]     = keys(iterated);
    this[INDEX]    = 0;
    this[KIND]     = kind;
  }
  ObjectIterator[PROTOTYPE] = {
    next: function(){
      var index  = this[INDEX]++
        , object = this[ITERATED]
        , keys   = this[KEYS]
        , key;
      if(index >= keys.length)return createIterResultObject(undefined, 1);
      key = keys[index];
      switch(this[KIND]){
        case KEY   : return createIterResultObject(key, 0);
        case VALUE : return createIterResultObject(object[key], 0);
      }
      return createIterResultObject([key, object[key]], 0);
    }
  }
  
  setTag(ArrayIterator, ARRAY + $ITERATOR);
  setTag(MapIterator, MAP + $ITERATOR);
  setTag(SetIterator, SET + $ITERATOR);
  setTag(ObjectIterator, OBJECT + $ITERATOR);
  
  ArrayIterator[PROTOTYPE][ITERATOR] = MapIterator[PROTOTYPE][ITERATOR] =
    SetIterator[PROTOTYPE][ITERATOR] = ObjectIterator[PROTOTYPE][ITERATOR] = returnThis;
  
  function defineIterator(object, value){
    has(object, ITERATOR) || (object[ITERATOR] = value);
  }
  
  C.isIterable = isIterable = function(it){
    if(it != undefined && isFunction(it[ITERATOR]))return true;
    // plug for library. TODO: correct proto check
    switch(it && it[CONSTRUCTOR]){
      case String: case Array: case Map: case Set: return true;
      case Object: return classof(it) == ARGUMENTS;
    } return false;
  }
  C.getIterator = getIterator = function(it){
    if(it != undefined && isFunction(it[ITERATOR]))return it[ITERATOR]();
    // plug for library. TODO: correct proto check
    switch(it && it[CONSTRUCTOR]){
      case Object : if(classof(it) != ARGUMENTS)break;
      case String :
      case Array  : return new ArrayIterator(it, VALUE);
      case Map    : return new MapIterator(it, KEY+VALUE);
      case Set    : return new SetIterator(it, VALUE);
    } throw TypeError(it + ' is not iterable!');
  }
  C.forOf = forOf = function(it, fn, that, entries){
    var iterator = getIterator(it), step, value;
    while(!(step = iterator.next()).done){
      if((entries ? fn.apply(that, ES5Object(step.value)) : fn.call(that, step.value)) === false)return;
    }
  }
  
  // v8 & FF fix
  isFunction($Array.keys) && defineIterator(getPrototypeOf([].keys()), returnThis);
  //isFunction(Set[PROTOTYPE].keys) && defineIterator(getPrototypeOf(new Set().keys()), returnThis);
  //isFunction(Map[PROTOTYPE].keys) && defineIterator(getPrototypeOf(new Map().keys()), returnThis);
  
  $define(PROTO, ARRAY, {
    // 22.1.3.4 Array.prototype.entries()
    entries: createIteratorFactory(ArrayIterator, KEY+VALUE),
    // 22.1.3.13 Array.prototype.keys()
    keys:    createIteratorFactory(ArrayIterator, KEY),
    // 22.1.3.29 Array.prototype.values()
    values:  createIteratorFactory(ArrayIterator, VALUE)
  });
  $define(PROTO, MAP, {
    // 23.1.3.4 Map.prototype.entries()
    entries: createIteratorFactory(MapIterator, KEY+VALUE),
    // 23.1.3.8 Map.prototype.keys()
    keys:    createIteratorFactory(MapIterator, KEY),
    // 23.1.3.11 Map.prototype.values()
    values:  createIteratorFactory(MapIterator, VALUE)
  });
  $define(PROTO, SET, {
    // 23.2.3.5 Set.prototype.entries()
    entries: createIteratorFactory(SetIterator, KEY+VALUE),
    // 23.2.3.8 Set.prototype.keys()
    keys:    createIteratorFactory(SetIterator, VALUE),
    // 23.2.3.10 Set.prototype.values()
    values:  createIteratorFactory(SetIterator, VALUE)
  });
  
  if(framework){
    // 21.1.3.27 String.prototype[@@iterator]()
    defineIterator(String[PROTOTYPE], createIteratorFactory(ArrayIterator, VALUE));
    // 22.1.3.30 Array.prototype[@@iterator]()
    defineIterator($Array, $Array.values);
    // 23.1.3.12 Map.prototype[@@iterator]()
    defineIterator(Map[PROTOTYPE], createIteratorFactory(MapIterator, KEY+VALUE));
    // 23.2.3.11 Set.prototype[@@iterator]()
    defineIterator(Set[PROTOTYPE], createIteratorFactory(SetIterator, VALUE));
  }
  
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
}(' Iterator', 1, 2, symbol('iterated'), symbol('kind'), symbol('index'), symbol('keys'), Function('return this'));

/*****************************
 * Module : dict
 *****************************/

!function(){
  function Dict(iterable){
    var dict = create(null);
    if(iterable != undefined){
      if(isIterable(iterable))forOf(iterable, function(key, value){
        dict[key] = value;
      }, undefined, 1);
      else assign(dict, iterable);
    }
    return dict;
  }
  Dict[PROTOTYPE] = null;
  function findKey(object, fn, that /* = undefined */){
    assertFunction(fn);
    var O      = ES5Object(object)
      , props  = keys(O)
      , length = props.length
      , i      = 0
      , key;
    while(length > i){
      if(fn.call(that, O[key = props[i++]], key, object))return key;
    }
  }
  function keyOf(object, searchElement){
    var O      = ES5Object(object)
      , props  = keys(O)
      , length = props.length
      , i      = 0
      , key;
    while(length > i)if(same0(O[key = props[i++]], searchElement))return key;
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
      assertFunction(fn);
      var O      = ES5Object(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i){
        if(!fn.call(that, O[key = props[i++]], key, object))return false;
      }
      return true;
    },
    filter: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , result = create(null)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i){
        if(fn.call(that, O[key = props[i++]], key, object))result[key] = O[key];
      }
      return result;
    },
    find: function(object, fn, that /* = undefined */){
      var index = findKey(object, fn, that);
      return index === undefined ? undefined : ES5Object(object)[index];
    },
    findKey: findKey,
    forEach: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i)fn.call(that, O[key = props[i++]], key, object);
      return object;
    },
    keyOf: keyOf,
    map: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , result = create(null)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i){
        result[key = props[i++]] = fn.call(that, O[key], key, object);
      }
      return result;
    },
    reduce: function(object, fn, result /* = undefined */, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , props  = keys(O)
        , i      = 0
        , length = props.length
        , key;
      if(arguments.length < 3){
        assert(length--, REDUCE_ERROR);
        result = O[props.shift()];
      }
      while(length > i){
        result = fn.call(that, result, O[key = props[i++]], key, object);
      }
      return result;
    },
    some: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i){
        if(fn.call(that, O[key = props[i++]], key, object))return true;
      }
      return false;
    },
    transform: function(object, mapfn, target /* = Dict() */){
      assertFunction(mapfn);
      target = target == undefined ? create(null) : Object(target);
      var O      = ES5Object(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i){
        if(mapfn(target, O[key = props[i++]], key, object) === false)break;
      }
      return target;
    },
    contains: function(object, value){
      return keyOf(object, value) !== undefined;
    },
    // Has / get own property
    has: has,
    get: function(object, key){
      if(has(object, key))return object[key];
    },
    isDict: function(it){
      return getPrototypeOf(it) == null;
    }
  });
  $define(GLOBAL, {Dict: Dict});
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
      , result   = this.apply(instance, ES5Object(args));
    return isObject(result) ? result : instance;
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
      this[ID] = set.apply(global, this[ARGUMENTS] = args)
    }
    Deferred[PROTOTYPE].set = function(){
      clear(this[ID]);
      this[ID] = set.apply(global, this[ARGUMENTS]);
      return this;
    }
    Deferred[PROTOTYPE].clear = function(){
      clear(this[ID]);
      return this;
    }
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

!function(){
  /**
   * Alternatives:
   * http://www.2ality.com/2013/06/auto-binding.html
   * http://livescript.net/#property-access -> foo~bar
   * http://lodash.com/docs#bindKey
   */
  function tie(key){
    var that        = this
      , _           = path._
      , placeholder = false
      , length      = arguments.length
      , i = 1, args;
    if(length < 2)return ctx(that[key], that);
    args = Array(length - 1)
    while(length > i)if((args[i - 1] = arguments[i++]) === _)placeholder = true;
    return createPartialApplication(that[key], args, length, placeholder, _, true, that);
  }
  var $tie = {tie: tie};
  $define(PROTO, FUNCTION, assign({
    /**
     * Partial apply.
     * Alternatives:
     * http://sugarjs.com/api/Function/fill
     * http://underscorejs.org/#partial
     * http://mootools.net/docs/core/Types/Function#Function:pass
     * http://fitzgen.github.io/wu.js/#wu-partial
     */
    part: part,
    by: function(that){
      var fn          = this
        , _           = path._
        , placeholder = false
        , length      = arguments.length
        , i = 1, args;
      if(length < 2)return ctx(fn, that);
      args = Array(length - 1);
      while(length > i)if((args[i - 1] = arguments[i++]) === _)placeholder = true;
      return createPartialApplication(fn, args, length, placeholder, _, true, that);
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
        return apply.call(fn, undefined, args);
      }
    }
  }, $tie));
  $define(PROTO, ARRAY, $tie);
  $define(PROTO, REGEXP, $tie);
  $define(STATIC, OBJECT, {
    tie: unbind(tie)
  });
  Export.useTie = function(){
    $define(PROTO, OBJECT, $tie);
    return _;
  }
}();

/*****************************
 * Module : object
 *****************************/

$define(STATIC, OBJECT, {
  /**
   * Alternatives:
   * http://underscorejs.org/#has
   * http://sugarjs.com/api/Object/has
   */
  isEnumerable: unbind(isEnumerable),
  isPrototype: unbind($Object.isPrototypeOf),
  // http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
  getPropertyDescriptor: getPropertyDescriptor,
  // http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
  // ES7 : http://esdiscuss.org/topic/april-8-2014-meeting-notes#content-1
  getOwnPropertyDescriptors: getOwnPropertyDescriptors,
  /**
   * Shugar for Object.create
   * Alternatives:
   * http://lodash.com/docs#create
   */
  make: function(proto, props){
    return props == undefined ? create(proto) : create(proto, getOwnPropertyDescriptors(props));
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
  values: function(object){
    var O      = ES5Object(object)
      , names  = keys(object)
      , length = names.length
      , i      = 0
      , result = Array(length);
    while(length > i)result[i] = O[names[i++]];
    return result;
  },
  // ~ ES7 : http://esdiscuss.org/topic/april-8-2014-meeting-notes#content-1
  entries: function(object){
    var O      = ES5Object(object)
      , names  = keys(object)
      , length = names.length
      , i      = 0
      , result = Array(length)
      , key;
    while(length > i)result[i] = [key = names[i++], O[key]];
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
  classof: classof,
  // Simple symbol API
  symbol: symbol,
  hidden: hidden
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
    index = toInteger(index);
    return ES5Object(this)[0 > index ? this.length + index : index];
  },
  /**
   * Alternatives:
   * http://lodash.com/docs#template
   */
  transform: transform,
  // ~ ES7 : http://esdiscuss.org/topic/april-8-2014-meeting-notes#content-1
  contains: function(value){
    var O      = ES5Object(this)
      , length = O.length
      , i      = 0;
    while(length > i)if(same0(value, O[i++]))return true;
    return false;
  }
});

/*****************************
 * Module : array_statics
 *****************************/

/**
 * Array static methods
 * http://wiki.ecmascript.org/doku.php?id=strawman:array_statics
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Array_generic_methods
 * JavaScript 1.6
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/1.6#Array_and_String_generics
 * Alternatives:
 * https://github.com/plusdude/array-generics
 * http://mootools.net/docs/core/Core/Core#Type:generics
 */
$define(STATIC, ARRAY, transform.call(
  // IE... getOwnPropertyNames($Array),
  array(
    // ES3:
    'concat,join,pop,push,reverse,shift,slice,sort,splice,unshift,' +
    // ES5:
    'indexOf,lastIndexOf,every,some,forEach,map,filter,reduce,reduceRight,' +
    // ES6:
    'fill,find,findIndex,keys,values,entries,' +
    // Core.js:
    'get,transform,contains'
  ),
  function(memo, key){
    if(key in $Array)memo[key] = unbind($Array[key]);
  }, {}
));

/*****************************
 * Module : number
 *****************************/

$define(STATIC, NUMBER, {
  /**
   * Alternatives:
   * http://mootools.net/docs/core/Types/Number#Number:toInt
   */
  toInteger: toInteger
});
$define(PROTO, NUMBER, {
  /**
   * Invoke function @ times and return array of results
   * Alternatives:
   * http://underscorejs.org/#times
   * http://sugarjs.com/api/Number/times
   * http://api.prototypejs.org/language/Number/prototype/times/
   * http://mootools.net/docs/core/Types/Number#Number:times
   */
  times: function(fn /* = -> it */, that /* = undefined */){
    var number = toLength(this)
      , result = Array(number)
      , i      = 0;
    if(isFunction(fn))while(number > i)result[i] = fn.call(that, i, i++, this);
    else while(number > i)result[i] = i++;
    return result;
  },
  random: function(number /* = 0 */){
    var a = +this   || 0
      , b = +number || 0
      , m = min(a, b);
    return random() * (max(a, b) - m) + m;
  }
});
$define(STATIC, 'Math', {
  /**
   * Alternatives:
   * http://underscorejs.org/#random
   * http://mootools.net/docs/core/Types/Number#Number:Number-random
   */
  randomInt: function(a /* = 0 */, b /* = 0 */){
    a = toInteger(a);
    b = toInteger(b);
    var m = min(a, b);
    return floor((random() * (max(a, b) + 1 - m)) + m);
  }
});
/**
 * Math functions in Number.prototype
 * Alternatives:
 * http://sugarjs.com/api/Number/math
 * http://mootools.net/docs/core/Types/Number#Number-Math
 */
$define(PROTO, NUMBER, transform.call(
  // IE... getOwnPropertyNames(Math)
  array(
    // ES3
    'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,sqrt,max,min,pow,atan2,' +
    // ES6
    'acosh,asinh,atanh,cbrt,clz32,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc,' +
    // Core.js
    'randomInt'
  ),
  function(memo, key){
    if(key in Math)memo[key] = (function(fn){
      return function(/*...args*/){
        // ie8- convert `this` to object -> convert it to number
        var args = [+this]
          , i    = 0;
        while(arguments.length > i)args.push(arguments[i++]);
        return fn.apply(undefined, args);
      }
    })(Math[key])
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
    , unescapeHTMLDict = transform.call(keys(escapeHTMLDict), function(memo, key){
        memo[escapeHTMLDict[key]] = key;
      }, {})
    , RegExpEscapeHTML   = /[&<>"']/g
    , RegExpUnescapeHTML = /&(?:amp|lt|gt|quot|apos);/g;
  $define(PROTO, STRING, {
    /**
     * Alternatives:
     * http://underscorejs.org/#escape
     * http://sugarjs.com/api/String/escapeHTML
     * http://api.prototypejs.org/language/String/prototype/escapeHTML/
     */
    escapeHTML: function(){
      return String(this).replace(RegExpEscapeHTML, function(part){
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
      return String(this).replace(RegExpUnescapeHTML, function(part){
        return unescapeHTMLDict[part];
      });
    }
  });
}();

/*****************************
 * Module : regexp
 *****************************/

!function(escape){
  /**
   * https://gist.github.com/kangax/9698100
   * Alternatives:
   * http://sugarjs.com/api/String/escapeRegExp
   * http://api.prototypejs.org/language/RegExp/escape/
   * http://mootools.net/docs/core/Types/String#String:escapeRegExp
   */
  $define(STATIC, REGEXP, {
    escape: function(it){
      return String(it).replace(escape, '\\$1');
    }
  });
}(/([\\\-[\]{}()*+?.,^$|])/g);

/*****************************
 * Module : date
 *****************************/

/**
 * Alternatives:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
 * https://github.com/andyearnshaw/Intl.js
 * http://momentjs.com/
 * http://sugarjs.com/api/Date/format
 * http://mootools.net/docs/more/Types/Date#Date:format
 */
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
          case 'ms'   : var ms = get('Milliseconds');                           // Milliseconds : 001-999
            return ms > 99 ? ms : ms > 9 ? '0' + ms : '00' + ms;
          case 's'    : return get(SECONDS);                                    // Seconds      : 1-59
          case 'ss'   : return lz(get(SECONDS));                                // Seconds      : 01-59
          case 'm'    : return get(MINUTES);                                    // Minutes      : 1-59
          case 'mm'   : return lz(get(MINUTES));                                // Minutes      : 01-59
          case 'h'    : return get(HOURS);                                      // Hours        : 0-23
          case 'hh'   : return lz(get(HOURS));                                  // Hours        : 00-23
          case 'D'    : return get(DATE)                                        // Date         : 1-31
          case 'DD'   : return lz(get(DATE));                                   // Date         : 01-31
          case 'W'    : return dict.W[get('Day')];                              // Day          : Понедельник
          case 'N'    : return get(MONTH) + 1;                                  // Month        : 1-12
          case 'NN'   : return lz(get(MONTH) + 1);                              // Month        : 01-12
          case 'M'    : return dict.M[get(MONTH)];                              // Month        : Январь
          case 'MM'   : return dict.MM[get(MONTH)];                             // Month        : Января
          case 'YY'   : return lz(get(YEAR) % 100);                             // Year         : 13
          case 'YYYY' : return get(YEAR);                                       // Year         : 2013
        }
        return part;
      });
    }
  }
  function lz(num){
    return num > 9 ? num : '0' + num;
  }
  function addLocale(lang, locale){
    locales[lang] = {
      W : array(locale.weekdays),
      MM: flexio(locale.months, 1),
      M : flexio(locale.months, 2)
    };
    return Date;
  }
  function flexio(locale, index){
    return transform.call(array(locale), function(memo, it){
      memo.push(it.replace(flexioRegExp, '$' + index));
    });
  }
  $define(STATIC, DATE, {
    locale: function(locale){
      return has(locales, locale) ? current = locale : current;
    },
    addLocale: addLocale
  });
  $define(PROTO, DATE, {
    format:    createFormat(0),
    formatUTC: createFormat(1)
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
 * Alternatives:
 * https://github.com/paulmillr/console-polyfill
 * https://github.com/theshock/console-cap
 */
!function(console){
  var $console = transform.call(
    array('assert,count,clear,debug,dir,dirxml,error,exception,' +
      'group,groupCollapsed,groupEnd,info,log,table,trace,warn,' +
      'markTimeline,profile,profileEnd,time,timeEnd,timeStamp'),
    function(memo, key){
      memo[key] = function(){
        if(enabled && console[key])return apply.call(console[key], console, arguments);
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
  $define(GLOBAL, {console: assign($console.log, $console)}, 1);
}(global.console || {});
}(typeof window != 'undefined' ? window : global, true);