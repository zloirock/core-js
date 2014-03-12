/**
 * Core.js v0.0.6
 * http://core.zloirock.ru
 * © 2014 Denis Pushkarev
 * Available under MIT license
 */
!function(global, framework, undefined){
'use strict';
/*****************************
 * Module : init
 *****************************/

var prototype      = 'prototype'
  // Aliases global objects and prototypes
  , Function       = global.Function
  , Object         = global.Object
  , Array          = global.Array
  , String         = global.String
  , Number         = global.Number
  , RegExp         = global.RegExp
  , Map            = global.Map
  , Set            = global.Set
  , WeakMap        = global.WeakMap
  , WeakSet        = global.WeakSet
  , Symbol         = global.Symbol
  , Math           = global.Math
  , TypeError      = global.TypeError
  , setTimeout     = global.setTimeout
  , clearTimeout   = global.clearTimeout
  , setInterval    = global.setInterval
  , setImmediate   = global.setImmediate
  , clearImmediate = global.clearImmediate
  , console        = global.console || {}
  , document       = global.document
  , module         = global.module
  , Infinity       = 1 / 0
  , $Array         = Array[prototype]
  , $Object        = Object[prototype]
  , $Function      = Function[prototype];
  
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
  , undescore = global._
  , _ = {
    noConflict: function(){
      global._ = undescore;
      return _;
    }
  };
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
  , __PROTO__   = '__proto__' in $Object
  , DESCRIPTORS = true;
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
function invert(object){
  object = ES5Object(object);
  var result = {}
    , names  = keys(object)
    , length = names.length
    , i      = 0
    , key;
  while(length > i)result[object[key = names[i++]]] = key;
  return result;
}

// Array:
// array('str1,str2,str3') => ['str1', 'str2', 'str3']
function array(it){
  return String(it).split(',');
}
var push    = $Array.push
  , unshift = $Array.unshift
  , slice   = $Array.slice
  , $slice  = Array.slice || function(arrayLike, from){
      return slice.call(arrayLike, from);
    }
// Dummy, fix for not array-like ES3 string in es5.js
var ES5Object = Object;
// simple reduce to object
function reduceTo(target, callbackfn){
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
  , MAX_SAFE_INTEGER = 0x1fffffffffffff; // pow(2, 53) - 1 == 9007199254740991
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

var ITERATOR   = Symbol && Symbol.iterator || '@@iterator'
  , symbolUniq = 0;
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

var forOf, isIterable, getIterator; // define in iterator mudule

var GLOBAL = 1
  , STATIC = 2
  , PROTO  = 4
  , $exports = module && module.exports ? (module.exports = _) : (global._ = _);
function $define(type, name, source, forced /* = false */){
  var target, exports, key, own, prop
    , isGlobal = type == GLOBAL;
  if(isGlobal){
    forced = source;
    source = name;
    target = global;
    exports = $exports;
  } else {
    target  = type == STATIC ? global[name] : (global[name] || $Object)[prototype];
    exports = $exports[name] || ($exports[name] = {});
  }
  for(key in source)if(has(source, key)){
    own = !forced && target && has(target, key) && (!isFunction(target[key]) || isNative(target[key]));
    prop = own ? target[key] : source[key];
    exports[key] = type == PROTO && isFunction(prop) ? unbind(prop) : prop;
    if(framework){
      !own && (isGlobal || delete target[key])
      && defineProperty(target, key, descriptor(6 + isGlobal, source[key]));
    }
  }
}
// wrap to prevent obstruction of the global constructors, when build as library
function wrapGlobalConstructor(Base){
  return !framework && isNative(Base) ? function(param){
    return this instanceof Base ? new Base(param) : Base(param);
  } : Base;
}

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
  $define(STATIC, 'Object', {
    // 19.1.3.1 Object.assign(target, source)
    // The assign function is used to copy the values of all of the enumerable
    // own properties from a source object to a target object.
    assign: assign,
    // 19.1.3.10 Object.is(value1, value2)
    is: same
  });
  __PROTO__ && $define(STATIC, 'Object', {
    // 19.1.3.19 Object.setPrototypeOf(O, proto)
    // work only if browser support __proto__, don't work with null proto objects
    setPrototypeOf: function(O, proto){
      assertObject(O);
      assert(isObject(proto) || proto === null, "Can't set", proto, 'as prototype');
      O.__proto__ = proto;
      return O;
    }
  });
  $define(STATIC, 'Number', {
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
  $define(STATIC, 'Math', {
    // 20.2.2.3 Math.acosh(x)
    // Returns an implementation-dependent approximation to the inverse hyperbolic cosine of x.
    acosh: function(x){
      return log(x + sqrt(x * x - 1));
    },
    // 20.2.2.5 Math.asinh(x)
    // Returns an implementation-dependent approximation to the inverse hyperbolic sine of x.
    asinh: function(x){
      return !isFinite(x = +x) || x === 0 ? x : log(x + sqrt(x * x + 1));
    },
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
    // 20.1.3.1 Number.prototype.clz()
    // Rename to Math.clz32 <= http://esdiscuss.org/notes/2014-01-28
    clz32: function(number){
      number = number >>> 0;
      return number ? 32 - number.toString(2).length : 32;
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
  /**
  $define(STATIC, 'String', {
    // 21.1.2.2 String.fromCodePoint(...codePoints)
    // fromCodePoint: function(){ TODO },
    // 21.1.2.4 String.raw(callSite, ...substitutions)
    raw: function(){ TODO }
  });
  */
  $define(PROTO, 'String', {
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
  $define(STATIC, 'Array', {
    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
    from: function(arrayLike, mapfn /* -> it */, thisArg /* = undefind */){
      (mapfn === undefined) || assertFunction(mapfn);
      var O      = ES5Object(arrayLike)
        , result = new (isFunction(this) ? this : Array)
        , i      = 0
        , length, iter, step;
      if(isIterable && isIterable(O)){
        iter = getIterator(O);
        while(!(step = iter.next()).done)result.push(mapfn ? mapfn.call(thisArg, step.value) : step.value);
      }
      else for(length = toLength(O.length); i < length; i++)result.push(mapfn ? mapfn.call(thisArg, O[i], i, O) : O[i]);
      return result;
    },
    // 22.1.2.3 Array.of( ...items)
    of: function(/*args...*/){
      var i      = 0
        , length = arguments.length
        , result = new (isFunction(this) ? this : Array)(length);
      while(i < length)result[i] = arguments[i++];
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
  $define(PROTO, 'Array', {
    // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
    // copyWithin: function(target, start, end){ TODO },
    // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
    fill: function(value, start /* = 0 */, end /* = @length */){
      var length = toLength(this.length);
      if((start |= 0) < 0 && (start = length + start) < 0)return this;
      end = end == undefined ? length : end | 0;
      while(end > start)this[start++] = value;
      return this;
    },
    // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
    find: function(predicate, thisArg /* = undefind */){
      var index = findIndex.call(this, predicate, thisArg);
      return index === -1 ? undefined : ES5Object(this)[index];
    },
    // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
    findIndex: findIndex
  });
}(isFinite);

/*****************************
 * Module : es6c
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
    if(iterable != undefined)forOf && forOf(iterable, isSet ? that.add : function(val){
      that.set(val[0], val[1]);
    }, that);
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
      hidden(Base[prototype], key, function(){
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
    F[prototype] = Base[prototype];
    return F;
  }
  
  function fastKey(it, create){
    return isObject(it)
      ? '_' + (has(it, STOREID)
        ? it[STOREID]
        : create ? defineProperty(it, STOREID, {value: uid++})[STOREID] : '')
      : typeof it == 'string' ? '$' + it : it;
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
  if(!isFunction(Map) || !has(Map[prototype], 'forEach')){
    Map = createCollectionConstructor('Map');
    assign(Map[prototype], {
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
    defineProperties(Map[prototype], sizeGetter);
  } else Map = fixCollection(Map, 'Map');
  
  // 23.2 Set Objects
  if(!isFunction(Set) || !has(Set[prototype], 'forEach')){
    Set = createCollectionConstructor('Set', 1);
    assign(Set[prototype], {
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
    defineProperties(Set[prototype], sizeGetter);
  } else Set = fixCollection(Set, 'Set', 1);
  
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
  if(!isFunction(WeakMap) || !has(WeakMap[prototype], 'clear')){
    WeakMap = createCollectionConstructor('WeakMap');
    assign(WeakMap[prototype], assign({
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
  } else WeakMap = fixCollection(WeakMap, 'WeakMap');
  
  // 23.4 WeakSet Objects
  if(!isFunction(WeakSet)){
    WeakSet = createCollectionConstructor('WeakSet', 1);
    assign(WeakSet[prototype], assign({
      // 23.4.3.1 WeakSet.prototype.add(value)
      add: function(value){
        assertObject(value);
        getWeakData(value)[this[WEAKID]] = true;
        return this;
      }
    }, weakCollectionMethods));
  } else WeakSet = fixCollection(WeakSet, 'WeakSet', 1);
  
  $define(GLOBAL, {
    Map: Map,
    Set: Set,
    WeakMap: WeakMap,
    WeakSet: WeakSet
  }, 1);
}();

/*****************************
 * Module : promise
 *****************************/

/**
 * ES6 Promises
 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects
 * https://github.com/domenic/promises-unwrapping
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 * http://kangax.github.io/es5-compat-table/es6/#Promise
 * http://caniuse.com/promises
 * Based on:
 * https://github.com/jakearchibald/ES6-Promises
 * Alternatives:
 * https://github.com/jakearchibald/ES6-Promises
 * https://github.com/inexorabletash/polyfill/blob/master/harmony.js
 */
!function(Promise){
  isFunction(Promise)
  &&  array('cast,resolve,reject,all,race').every(part.call(has, Promise))
  // Older version of the spec had a resolver object as the arg rather than a function
  // Experimental implementations contains a number of inconsistencies with the spec,
  // such as this: onFulfilled must be a function or undefined
  &&  (function(resolve){
        try {
          new Promise(function(r){
            resolve = r;
          }).then(null);
          return isFunction(resolve);
        } catch(e){}
      })()
  || !function(){
    var PENDING
      , SEALED    = 0
      , FULFILLED = 1
      , REJECTED  = 2
      , SUBSCRIBERS = symbol('subscribers')
      , STATE       = symbol('state')
      , DETAIL      = symbol('detail');
    // 25.4.3 The Promise Constructor
    Promise = function(resolver){
      var promise       = this
        , rejectPromise = part.call(handle, promise, REJECTED);
      assertInstance(promise, Promise, 'Promise');
      assertFunction(resolver);
      promise[SUBSCRIBERS] = [];
      try {
        resolver(part.call(resolve, promise), rejectPromise);
      } catch(e){
        rejectPromise(e);
      }
    }
    function invokeCallback(settled, promise, callback, detail){
      var hasCallback = isFunction(callback)
        , value, error, succeeded, failed;
      if(hasCallback){
        try {
          value     = callback(detail);
          succeeded = 1;
        } catch(e){
          failed = 1;
          error  = e;
        }
      } else {
        value = detail;
        succeeded = 1;
      }
      if(handleThenable(promise, value))return;
      else if(hasCallback && succeeded)resolve(promise, value);
      else if(failed)handle(promise, REJECTED, error);
      else if(settled == FULFILLED)resolve(promise, value);
      else if(settled == REJECTED)handle(promise, REJECTED, value);
    }
    assign(Promise[prototype], {
      // 25.4.5.1 Promise.prototype.catch(onRejected)
      'catch': function(onRejected){
        return this.then(undefined, onRejected);
      },
      // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
      then: function(onFulfilled, onRejected){
        var promise     = this
          , thenPromise = new Promise(Function());
        if(promise[STATE])setImmediate(function(){
          invokeCallback(promise[STATE], thenPromise, arguments[promise[STATE] - 1], promise[DETAIL]);
        }, onFulfilled, onRejected);
        else promise[SUBSCRIBERS].push(thenPromise, onFulfilled, onRejected);
        return thenPromise;
      }
    });
    assign(Promise, {
      // 25.4.4.1 Promise.all(iterable)
      all: function(iterable){
        var values = [];
        forOf(iterable, values.push, values);
        return new this(function(resolve, reject){
          var remaining = values.length
            , results   = Array(remaining);
          function resolveAll(index, value){
            results[index] = value;
            --remaining || resolve(results);
          }
          if(remaining)values.forEach(function(promise, i){
            promise && isFunction(promise.then)
              ? promise.then(part.call(resolveAll, i), reject)
              : resolveAll(i, promise);
          });
          else resolve(results);
        });
      },
      // 25.4.4.2 Promise.cast(x)
      cast: function(x){
        return x instanceof this ? x : $resolve.call(this, x);
      },
      // 25.4.4.4 Promise.race(iterable)
      race: function(iterable){
        var iter = getIterator(iterable);
        return new this(function(resolve, reject){
          forOf(iter, function(promise){
            promise && isFunction(promise.then)
              ? promise.then(resolve, reject)
              : resolve(promise);
          });
        });
      },
      // 25.4.4.5 Promise.reject(r)
      reject: function(r){
        return new this(function(resolve, reject){
          reject(r);
        });
      },
      // 25.4.4.6 Promise.resolve(x)
      resolve: $resolve
    });
    function $resolve(x){
      return new this(function(resolve, reject){
        resolve(x);
      });
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
        setImmediate(function(){
          promise[STATE] = state;
          for(var subscribers = promise[SUBSCRIBERS], i = 0; i < subscribers.length; i += 3){
            invokeCallback(state, subscribers[i], subscribers[i + state], promise[DETAIL]);
          }
          promise[SUBSCRIBERS] = undefined;
        });
      }
    }
  }();
  $define(GLOBAL, {Promise: Promise}, 1);
}(global.Promise);

/*****************************
 * Module : symbol
 *****************************/

/**
 * ECMAScript 6 Symbol
 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-symbol-objects
 * Alternatives:
 * http://webreflection.blogspot.com.au/2013/03/simulating-es6-symbols-in-es5.html
 * https://github.com/seanmonstar/symbol
 */
!function(TAG, SymbolRegistry){
  // 19.4.1 The Symbol Constructor
  if(!isNative(Symbol)){
    Symbol = function(description){
      var tag = symbol(description);
      defineProperty($Object, tag, {
        set: function(value){
          hidden(this, tag, value);
        }
      });
      if(!(this instanceof Symbol))return tag;
      hidden(this, TAG, tag);
    }
    Symbol[prototype].toString = Symbol[prototype].valueOf = function(){
      return this[TAG];
    }
  }
  $define(GLOBAL, {Symbol: wrapGlobalConstructor(Symbol)}, 1);
  $define(STATIC, 'Symbol', {
    // 19.4.2.2 Symbol.for(key)
    'for': function(key){
      return has(SymbolRegistry, key) ? SymbolRegistry[key] : SymbolRegistry[key] = new Symbol(key);
    },
    // 19.4.2.6 Symbol.iterator
    iterator: ITERATOR,
    // 19.4.2.7 Symbol.keyFor(sym)
    keyFor: function(sym){
      for(var key in SymbolRegistry)if(SymbolRegistry[key] === sym)return key;
    }
  });
}(symbol('tag'), {});

/*****************************
 * Module : reflect
 *****************************/

/**
 * 26.1 The Reflect Object
 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-reflect-object
 */
var id = Function('x', 'return x');
$define(GLOBAL, {Reflect: {}});
$define(STATIC, 'Reflect', {
  // 26.1.1 Reflect.defineProperty(target, propertyKey, attributes)
  defineProperty: defineProperty,
  // 26.1.2 Reflect.deleteProperty(target, propertyKey)
  deleteProperty: function(target, propertyKey){
    return delete target[propertyKey];
  },
  // 26.1.3 Reflect.enumerate(target)
  enumerate: function(target){
    var list = [], key;
    for(key in target)list.push(key);
    return list;
  },
  // 26.1.4 Reflect.get(target, propertyKey, receiver=target)
  get: function(target, propertyKey, receiver){
    if(arguments.length < 3)return target[propertyKey];
    var desc = getPropertyDescriptor(target, propertyKey);
    return desc && isFunction(desc.get) ? desc.get.call(receiver) : target[propertyKey];
  },
  // 26.1.5 Reflect.getOwnPropertyDescriptor(target, propertyKey)
  getOwnPropertyDescriptor: getOwnPropertyDescriptor,
  // 26.1.6 Reflect.getPrototypeOf(target)
  getPrototypeOf: getPrototypeOf,
  // 26.1.7 Reflect.has(target, propertyKey)
  has: function(target, propertyKey){
    return propertyKey in target;
  },
  // 26.1.8 Reflect.hasOwn(target, propertyKey) Deprecated???
  hasOwn: has,
  // 26.1.9 Reflect.isExtensible(target)
  isExtensible: Object.isExtensible || Function('return !0'),
  // 26.1.10 Reflect.ownKeys(target)
  ownKeys: function(target){
    return getIterator(keys(target));
  },
  // 26.1.11 Reflect.preventExtensions(target)
  preventExtensions: Object.preventExtensions || id,
  // 26.1.12 Reflect.set(target, propertyKey, V, receiver=target)
  set: function(target, propertyKey, V, receiver){
    if(arguments.length < 3)return target[propertyKey] = V;
    var desc = getPropertyDescriptor(target, propertyKey);
    return desc && isFunction(desc.set) ? desc.set.call(receiver, V) : target[propertyKey] = V;
  },
  // 26.1.13 Reflect.setPrototypeOf(target, proto)
  setPrototypeOf: Object.setPrototypeOf || id
});

/*****************************
 * Module : iterator
 *****************************/

!function(){
  var KEY      = 1
    , VALUE    = 2
    , ITERATED = symbol('iterated')
    , KIND     = symbol('kind')
    , INDEX    = symbol('index')
    , KEYS     = symbol('keys')
    , returnThis = Function('return this');
  function createIterResultObject(value, done){
    return {value: value, done: !!done};
  }
  function createIteratorFactory(constructor, kind){
    return function(){
      return new constructor(this, kind);
    }
  }
  
  function StringIterator(iterated){
    this[ITERATED] = iterated;
    this[INDEX]    = 0;
  }
  StringIterator[prototype].next = function(){
    var iterated = this[ITERATED]
      , index    = this[INDEX]++;
    return index < iterated.length
      ? createIterResultObject(iterated.charAt(index), 0)
      : createIterResultObject(undefined, 1);
  }
  
  function ArrayIterator(iterated, kind){
    this[ITERATED] = iterated;
    this[KIND]     = kind;
    this[INDEX]    = 0;
  }
  ArrayIterator[prototype].next = function(){
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
  
  function MapIterator(iterated, kind){
    this[ITERATED] = iterated;
    this[KIND]     = kind;
    this[INDEX]    = 0;
    iterated.forEach(function(val, key){
      this.push(key);
    }, this[KEYS] = []);
  }
  MapIterator[prototype].next = function(){
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
  
  function SetIterator(iterated, kind){
    this[KIND]  = kind;
    this[INDEX] = 0;
    iterated.forEach(function(val){
      this.push(val);
    }, this[KEYS] = []);
  }
  SetIterator[prototype].next = function(){
    var keys  = this[KEYS]
      , index = this[INDEX]++
      , key;
    if(index >= keys.length)return createIterResultObject(undefined, 1);
    key = keys[index];
    if(this[KIND] == VALUE)return createIterResultObject(key, 0);
    return createIterResultObject([key, key], 0);
  }
  
  StringIterator[prototype][ITERATOR] = ArrayIterator[prototype][ITERATOR] = MapIterator[prototype][ITERATOR] = SetIterator[prototype][ITERATOR] = returnThis;
  
  function defineIterator(object, value){
    ITERATOR in object || hidden(object, ITERATOR, value);
  }
  
  isIterable = function(it){
    if(it != undefined && isFunction(it[ITERATOR]))return true;
    // plug for library
    switch(it && it.constructor){
      case String: case Array: case Map: case Set:
        return true;
    }
    return false;
  }
  getIterator = function(it){
    if(it != undefined && isFunction(it[ITERATOR]))return it[ITERATOR]();
    // plug for library
    switch(it && it.constructor){
      case String : return new StringIterator(it);
      case Array  : return new ArrayIterator(it, VALUE);
      case Map    : return new MapIterator(it, KEY+VALUE);
      case Set    : return new SetIterator(it, VALUE);
    }
    throw TypeError(it + ' is not iterable!');
  }
  forOf = function(it, fn, that){
    var iterator = getIterator(it), step;
    while(!(step = iterator.next()).done)if(fn.call(that, step.value) === _)return;
  }
  
  // v8 fix
  framework && isFunction($Array.keys) && defineIterator(getPrototypeOf([].keys()), returnThis);
  
  $define(PROTO, 'Array', {
    // 22.1.3.4 Array.prototype.entries()
    entries: createIteratorFactory(ArrayIterator, KEY+VALUE),
    // 22.1.3.13 Array.prototype.keys()
    keys: createIteratorFactory(ArrayIterator, KEY),
    // 22.1.3.29 Array.prototype.values()
    values: createIteratorFactory(ArrayIterator, VALUE)
  });
  $define(PROTO, 'Map', {
    // 23.1.3.4 Map.prototype.entries()
    entries: createIteratorFactory(MapIterator, KEY+VALUE),
    // 23.1.3.8 Map.prototype.keys()
    keys: createIteratorFactory(MapIterator, KEY),
    // 23.1.3.11 Map.prototype.values()
    values: createIteratorFactory(MapIterator, VALUE)
  });
  $define(PROTO, 'Set', {
    // 23.2.3.5 Set.prototype.entries()
    entries: createIteratorFactory(SetIterator, KEY+VALUE),
    // 23.2.3.8 Set.prototype.keys()
    keys: createIteratorFactory(SetIterator, VALUE),
    // 23.2.3.10 Set.prototype.values()
    values: createIteratorFactory(SetIterator, VALUE)
  });
  
  if(framework){
    // 21.1.3.27 String.prototype[@@iterator]()
    defineIterator(String[prototype], createIteratorFactory(StringIterator));
    // 22.1.3.30 Array.prototype[@@iterator]()
    defineIterator($Array, $Array.values);
    // 23.1.3.12 Map.prototype[@@iterator]()
    defineIterator(Map[prototype], createIteratorFactory(MapIterator, KEY+VALUE));
    // 23.2.3.11 Set.prototype[@@iterator]()
    defineIterator(Set[prototype], createIteratorFactory(SetIterator, VALUE));
  }
  
  $define(GLOBAL, {forOf: forOf});
}();

/*****************************
 * Module : extendedObjectAPI
 *****************************/

/**
 * Extended object api from harmony and strawman :
 * http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
 * http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
 */
$define(STATIC, 'Object', {
  getPropertyDescriptor: getPropertyDescriptor,
  getOwnPropertyDescriptors: getOwnPropertyDescriptors,
  getPropertyDescriptors: function(object){
    var result = getOwnPropertyDescriptors(object);
    while(object = getPrototypeOf(object)){
      result = assign(getOwnPropertyDescriptors(object), result);
    }
    return result;
  },
  getPropertyNames: function(object){
    var result = getOwnPropertyNames(object);
    while(object = getPrototypeOf(object)){
      getOwnPropertyNames(object).forEach(function(key){
        ~result.indexOf(key) || result.push(key);
      });
    }
    return result;
  }
});

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
isFunction(setImmediate) && isFunction(clearImmediate) || !function(process, postMessage, MessageChannel, onreadystatechange){
  var IMMEDIATE_PREFIX = symbol('immediate')
    , counter = 0
    , queue   = {}
    , defer, channel;
  setImmediate = function(fn){
    var id   = IMMEDIATE_PREFIX + ++counter
      , args = $slice(arguments, 1);
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
  if(classof(process) == 'process'){
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
  // always run before timers, like nextTick => some problems with recursive call
  } else if(document && onreadystatechange in document.createElement('script')){
    defer = function(id){
      var el = document.createElement('script');
      el[onreadystatechange] = function(){
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
}(global.process, global.postMessage, global.MessageChannel, 'onreadystatechange');
$define(GLOBAL, {
  setImmediate: setImmediate,
  clearImmediate: clearImmediate
});

/*****************************
 * Module : function
 *****************************/

function inherits(parent){
  assertFunction(this); assertFunction(parent);
  this[prototype] = create(parent[prototype], getOwnPropertyDescriptors(this[prototype]));
  return this;
}
$define(STATIC, 'Function', {
  /**
   * Alternatives:
   * http://underscorejs.org/#isFunction
   * http://sugarjs.com/api/Object/isType
   * http://api.prototypejs.org/language/Object/isFunction/
   * http://api.jquery.com/jQuery.isFunction/
   * http://docs.angularjs.org/api/angular.isFunction
   */
  isFunction: isFunction,
  isNative: isNative,
  inherits: unbind(inherits),
  _: _
});
$define(PROTO, 'Function', {
  invoke: function(args){
    assertFunction(this);
    var instance = create(this[prototype])
      , result   = this.apply(instance, ES5Object(args || []));
    return isObject(result) ? result : instance;
  },
  inherits: inherits
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
      this[ARGUMENTS] = args;
    }
    assign(Deferred[prototype], {
      set: function(){
        this[ID] && clear(this[ID]);
        this[ID] = set.apply(global, this[ARGUMENTS]);
        return this;
      },
      clear: function(){
        this[ID] && clear(this[ID]);
        return this;
      },
      clone: function(){
        return new Deferred(this[ARGUMENTS]).set();
      }
    });
    return function(/* args... */){
      var args = [this], i = 0;
      while(arguments.length > i)args.push(arguments[i++]);
      return new Deferred(args).set();
    }
  }
  $define(PROTO, 'Function', {
    timeout:   createDeferredFactory(setTimeout, clearTimeout),
    interval:  createDeferredFactory(setInterval, clearInterval),
    immediate: createDeferredFactory(setImmediate, clearImmediate)
  });
}(symbol('arguments'), symbol('id'));

/*****************************
 * Module : binding
 *****************************/

function tie(key){
  var that = this
    , placeholder = false
    , i = 1, length, args;
  assertObject(that);
  length = arguments.length;
  if(length < 2)return ctx(that[key], that);
  args = Array(length - 1)
  while(length > i)if((args[i - 1] = arguments[i++]) === _)placeholder = true;
  return createPartialApplication(that[key], args, length, placeholder, true, that);
}
$define(PROTO, 'Function', {
  tie: tie,
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
    var fn = this
      , placeholder = false
      , length = arguments.length
      , i = 1, args;
    if(length < 2)return ctx(fn, that);
    args = Array(length - 1);
    while(length > i)if((args[i - 1] = arguments[i++]) === _)placeholder = true;
    return createPartialApplication(fn, args, length, placeholder, true, that);
  },
  /**
   * function -> method
   * Alternatives:
   * http://api.prototypejs.org/language/Function/prototype/methodize/
   */
  methodize: methodize
});
$define(PROTO, 'Array', {tie: tie});
$define(PROTO, 'RegExp', {tie: tie});
$define(STATIC, 'Object', {
  /**
   * Alternatives:
   * http://www.2ality.com/2013/06/auto-binding.html
   * http://livescript.net/#property-access -> foo~bar
   * http://lodash.com/docs#bindKey
   */
  tie: unbind(tie),
  useTie: part.call($define, PROTO, 'Object', {tie: tie})
});

/*****************************
 * Module : object
 *****************************/

!function(){
  function mixin(target, source){
    return defineProperties(target, getOwnPropertyDescriptors(source));
  }
  function make(proto, props, desc){
    return props ? (desc ? mixin : assign)(create(proto), props) : create(proto);
  }
  function merge(target, source, deep /* = false */, reverse /* = false */, desc /* = false */, stackA, stackB){
    if(isObject(target) && isObject(source)){
      var isComp = isFunction(reverse)
        , names  = (desc ? getOwnPropertyNames : keys)(source)
        , length = names.length
        , i      = 0
        , key, targetDescriptor, sourceDescriptor;
      while(length > i){
        key = names[i++];
        if(has(target, key) && (isComp ? reverse(target[key], source[key]) : reverse)){// if key in target && reverse merge
          deep && merge(target[key], source[key], 1, reverse, desc, stackA, stackB);   // if not deep - skip
        } else if(desc){
          targetDescriptor = getOwnPropertyDescriptor(target, key) || $Object;
          if(targetDescriptor.configurable !== false && delete target[key]){
            sourceDescriptor = getOwnPropertyDescriptor(source, key);
            if(deep && !sourceDescriptor.get && !sourceDescriptor.set){
              sourceDescriptor.value =
                merge(clone(sourceDescriptor.value, 1, 1, stackA, stackB),
                  targetDescriptor.value, 1, 1, 1, stackA, stackB);
            }
            defineProperty(target, key, sourceDescriptor);
          }
        } else target[key] = deep
          ? merge(clone(source[key], 1, 0, stackA, stackB), target[key], 1, 1, 0, stackA, stackB)
          : source[key];
      }
    }
    return target;
  }
  /**
   * NB:
   * http://wiki.ecmascript.org/doku.php?id=strawman:structured_clone
   * https://github.com/dslomov-chromium/ecmascript-structured-clone
   */
  function clone(object, deep /* = false */, desc /* = false */, stackA, stackB){
    if(!isObject(object))return object;
    var already = stackA.indexOf(object)
      , F       = object.constructor
      , result;
    if(~already)return stackB[already];
    switch(classof(object)){
      case 'Arguments' :
      case 'Array'     :
        result = Array(object.length);
        break;
      case 'Function'  :
        return object;
      case 'RegExp'    :
        result = RegExp(object.source, String(object).match(/[^\/]*$/)[0]);
        break;
      case 'String'    :
        return new F(object);
      case 'Boolean'   :
      case 'Date'      :
      case 'Number'    :
        result = new F(object.valueOf());
        break;
      /*
      case 'Set'       :
        result = new F;
        object.forEach(result.add, result);
        break;
      case 'Map'       :
        result = new F;
        object.forEach(function(val, key){
          result.set(key, val);
        });
        break;
      */
      default:
        result = create(getPrototypeOf(object));
    }
    stackA.push(object);
    stackB.push(result);
    return merge(result, object, deep, 0, desc, stackA, stackB);
  }
  // Objects deep compare
  function isEqual(a, b, StackA, StackB){
    if(same(a, b))return true;
    var type = classof(a)
      , length, keys, val;
    if(
      !isObject(a) ||
      !isObject(b) ||
      type != classof(b) ||
      getPrototypeOf(a) != getPrototypeOf(b)
    )return false;
    StackA = StackA.concat([a]);
    StackB = StackB.concat([b]);
    switch(type){
      case 'Boolean'   :
      case 'String'    :
      case 'Number'    : return a.valueOf() == b.valueOf();
      case 'RegExp'    : return '' + a == '' + b;
      case 'Error'     : return a.message == b.message;/*
      case 'Array'     :
      case 'Arguments' :
        length = toLength(a.length);
        if(length != b.length)return false;
        while(length--){
          if(
            !(~StackA.indexOf(a[length]) && ~StackB.indexOf(b[length]))
            && !isEqual(a[length], b[length], StackA, StackB)
          )return false;
        }
        return true;*/
    }
    keys = getOwnPropertyNames(a);
    length = keys.length;
    if(length != getOwnPropertyNames(b).length)return false;
    while(length--){
      if(
        !(~StackA.indexOf(a[val = keys[length]]) && ~StackB.indexOf(b[val]))
        && !isEqual(a[val], b[val], StackA, StackB)
      )return false;
    }
    return true;
  }
  function findIndex(object, fn, that /* = undefined */){
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
  $define(STATIC, 'Object', {
    /**
     * Alternatives:
     * http://underscorejs.org/#has
     * http://sugarjs.com/api/Object/has
     */
    isEnumerable: unbind(isEnumerable),
    isPrototype: unbind($Object.isPrototypeOf),
    hasOwn: has,
    getOwn: function(object, key){
      return has(object, key) ? object[key] : undefined;
    },
    /**
     * Alternatives:
     * http://livescript.net/#operators -> typeof!
     * http://mootools.net/docs/core/Core/Core#Core:typeOf
     * http://api.jquery.com/jQuery.type/
     */
    classof: classof,
    /**
     * Shugar for Object.create
     * Alternatives:
     * http://lodash.com/docs#create
     */
    make: make,
    // Shugar for Object.make(null[, props])
    plane: part.call(make, null),
    /**
     * 19.1.3.15 Object.mixin ( target, source ) <= Removed in Draft Rev 22, January 20, 2014, http://esdiscuss.org/topic/november-19-2013-meeting-notes#content-1
     * TODO: rename
     */
    mixin: mixin,
    /**
     * Alternatives:
     * http://underscorejs.org/#clone
     * http://lodash.com/docs#cloneDeep
     * http://sugarjs.com/api/Object/clone
     * http://api.prototypejs.org/language/Object/clone/
     * http://mootools.net/docs/core/Types/Object#Object:Object-clone
     * http://docs.angularjs.org/api/angular.copy
     */
    clone: function(object, deep /* = false */, desc /* = false */){
      return clone(object, deep, desc, [], []);
    },
    /**
     * Alternatives:
     * http://lodash.com/docs#merge
     * http://sugarjs.com/api/Object/merge
     * http://mootools.net/docs/core/Types/Object#Object:Object-merge
     * http://api.jquery.com/jQuery.extend/
     */
    merge: function(target, source, deep /* = false */, reverse /* = false */, desc /* = false */){
      return merge(target, source, deep, reverse, desc, [], []);
    },
    /**
     * Shugar for Object.merge(target, props, 1, 1)
     * Alternatives:
     * http://underscorejs.org/#defaults
     */
    defaults: function(target, props){
      return merge(target, props, 1, 1, 0, [], []);
    },
    /**
     * {a: b} -> [b]
     * Alternatives:
     * http://underscorejs.org/#values
     * http://sugarjs.com/api/Object/values
     * http://api.prototypejs.org/language/Object/values/
     * http://mootools.net/docs/core/Types/Object#Object:Object-values
     */
    values: function(object){
      var props  = keys(object)
        , length = props.length
        , result = Array(length)
        , i      = 0;
      while(length > i)result[i] = object[props[i++]];
      return result;
    },
    /**
     * {a: b} -> {b: a}
     * Alternatives:
     * http://underscorejs.org/#invert
     */
    invert: invert,
    // Enumerable
    /**
     * Alternatives:
     * http://underscorejs.org/#every
     * http://sugarjs.com/api/Object/enumerable
     * http://mootools.net/docs/core/Types/Object#Object:Object-every
     */
    every: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i)if(!fn.call(that, O[key = props[i++]], key, object))return false;
      return true;
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#filter
     * http://sugarjs.com/api/Object/enumerable
     * http://mootools.net/docs/core/Types/Object#Object:Object-filter
     */
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
    /**
     * Alternatives:
     * http://underscorejs.org/#find
     * http://sugarjs.com/api/Object/enumerable
     */
    find: function(object, fn, that /* = undefined */){
      var index = findIndex(object, fn, that);
      return index === undefined ? undefined : ES5Object(object)[index];
    },
    findIndex: findIndex,
    /**
     * Alternatives:
     * http://underscorejs.org/#each
     * http://sugarjs.com/api/Object/enumerable
     * http://mootools.net/docs/core/Types/Object#Object:Object-each
     * http://api.jquery.com/jQuery.each/
     * http://docs.angularjs.org/api/angular.forEach
     */
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
    /**
     * Alternatives:
     * http://mootools.net/docs/core/Types/Object#Object:Object-keyOf
     */
    indexOf: function(object, searchElement){
      var O      = ES5Object(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i)if(same(O[key = props[i++]], searchElement))return key;
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#map
     * http://sugarjs.com/api/Object/enumerable
     * http://mootools.net/docs/core/Types/Object#Object:Object-map
     * http://api.jquery.com/jQuery.map/
     */
    map: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , result = create(null)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i)result[key = props[i++]] = fn.call(that, O[key], key, object);
      return result;
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#reduce
     * http://sugarjs.com/api/Object/enumerable
     */
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
      while(length > i)result = fn.call(that, result, O[key = props[i++]], key, object);
      return result;
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#some
     * http://sugarjs.com/api/Object/enumerable
     * http://mootools.net/docs/core/Types/Object#Object:Object-some
     */
    some: function(object, fn, that /* = undefined */){
      assertFunction(fn);
      var O      = ES5Object(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i)if(fn.call(that, O[key = props[i++]], key, object))return true;
      return false;
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#pluck
     * http://sugarjs.com/api/Array/map
     */
    pluck: function(object, prop){
      object = ES5Object(object);
      var names  = keys(object)
        , result = create(null)
        , length = names.length
        , i      = 0
        , key, val;
      while(length > i){
        key = names[i++];
        val = object[key];
        result[key] = val == undefined ? undefined : val[prop];
      }
      return result;
    },
    reduceTo: function(object, target, callbackfn){
      if(arguments.length < 3){
        callbackfn = target;
        target = create(null);
      }
      else target = Object(target);
      assertFunction(callbackfn);
      var O      = ES5Object(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i)callbackfn(target, O[key = props[i++]], key, object);
      return target;
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
     * http://underscorejs.org/#isEqual
     * http://sugarjs.com/api/Object/equal
     * http://docs.angularjs.org/api/angular.equals
     * http://fitzgen.github.io/wu.js/#wu-eq
     */
    isEqual: part.call(isEqual, _, _, [], []),
    symbol: symbol,
    hidden: hidden
  });
}();

/*****************************
 * Module : array
 *****************************/

$define(PROTO, 'Array', {
  /**
   * Alternatives:
   * http://sugarjs.com/api/Array/at
   * With Proxy: http://www.h3manth.com/new/blog/2013/negative-array-index-in-javascript/
   */
  at: function(index){
    return this[0 > (index |= 0) ? this.length + index : index];
  },
  /**
   * Alternatives:
   * http://underscorejs.org/#pluck
   * http://sugarjs.com/api/Array/map
   * http://api.prototypejs.org/language/Enumerable/prototype/pluck/
   */
  pluck: function(key){
    var that   = ES5Object(this)
      , length = toLength(that.length)
      , result = Array(length)
      , i      = 0
      , val;
    for(; length > i; i++)if(i in that){
      val = that[i];
      result[i] = val == undefined ? undefined : val[key];
    }
    return result;
  },
  reduceTo: reduceTo,
  /**
   * Alternatives:
   * http://mootools.net/docs/core/Types/Array#Array:append
   * http://api.jquery.com/jQuery.merge/
   */
  merge: function(arrayLike){
    push.apply(this, ES5Object(arrayLike));
    return this;
  }
});

/*****************************
 * Module : arrayStatics
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
$define(STATIC, 'Array', reduceTo.call(
  // IE... getOwnPropertyNames($Array),
  array(
    // ES3:
    // http://www.2ality.com/2012/02/concat-not-generic.html
    'join,pop,push,reverse,shift,slice,sort,splice,unshift,' +
    // ES5:
    'indexOf,lastIndexOf,every,some,forEach,map,filter,reduce,reduceRight,' +
    // ES6:
    'fill,find,findIndex,' +
    // Core.js:
    'at,pluck,reduceTo,merge'
  ),
  function(memo, key){
    if(key in $Array)memo[key] = unbind($Array[key]);
  }
));

/*****************************
 * Module : number
 *****************************/

$define(STATIC, 'Number', {
  /**
   * Alternatives:
   * http://mootools.net/docs/core/Types/Number#Number:toInt
   */
  toInteger: toInteger
});
$define(PROTO, 'Number', {
  /**
   * Invoke function @ times and return array of results
   * Alternatives:
   * http://underscorejs.org/#times
   * http://sugarjs.com/api/Number/times
   * http://api.prototypejs.org/language/Number/prototype/times/
   * http://mootools.net/docs/core/Types/Number#Number:times
   */
  times: function(fn, that /* = undefined */){
    assertFunction(fn);
    var number = toLength(this)
      , result = Array(number)
      , i      = 0;
    while(number > i)result[i] = fn.call(that, i, i++, this);
    return result;
  },
  random: function(number /* = 0 */){
    var a = +this   || 0
      , b = +number || 0
      , m = min(a, b);
    return random() * (max(a, b) - m) + m;
  },
  /**
   * Alternatives:
   * http://underscorejs.org/#random
   * http://mootools.net/docs/core/Types/Number#Number:Number-random
   */
  rand: function(number /* = 0 */){
    var a = toInteger(this)
      , b = toInteger(number)
      , m = min(a, b);
    return floor((random() * (max(a, b) + 1 - m)) + m);
  }
});
/**
 * Math functions in Number.prototype
 * Alternatives:
 * http://sugarjs.com/api/Number/math
 * http://mootools.net/docs/core/Types/Number#Number-Math
 */
$define(PROTO, 'Number', reduceTo.call(
  // IE... getOwnPropertyNames(Math)
  array(
    // ES3
    'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,sqrt,max,min,pow,atan2,' +
    // ES6
    'acosh,asinh,atanh,cbrt,clz32,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc'
  ),
  function(memo, key){
    if(key in Math)memo[key] = methodize.call(Math[key]);
  }
));

/*****************************
 * Module : string
 *****************************/

!function(){
  var dictionaryEscapeHTML = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
        '/': '&#x2f;'
      }
    , dictionaryUnescapeHTML = invert(dictionaryEscapeHTML)
    , RegExpEscapeHTML   = /[&<>"'/]/g
    , RegExpUnescapeHTML = RegExp('(' + keys(dictionaryUnescapeHTML).join('|') + ')', 'g')
    , RegExpEscapeRegExp = /([\\\/'*+?|()\[\]{}.^$])/g;
  $define(PROTO, 'String', {
    /**
     * Alternatives:
     * http://sugarjs.com/api/String/at
     */
    at: function(index){
      return String(this).charAt(0 > (index |= 0) ? this.length + index : index);
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#escape
     * http://sugarjs.com/api/String/escapeHTML
     * http://api.prototypejs.org/language/String/prototype/escapeHTML/
     */
    escapeHTML: function(){
      return String(this).replace(RegExpEscapeHTML, function(part){
        return dictionaryEscapeHTML[part];
      });
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#unescape
     * http://sugarjs.com/api/String/unescapeHTML
     * http://api.prototypejs.org/language/String/prototype/unescapeHTML/
     */
    unescapeHTML: function(){
      return String(this).replace(RegExpUnescapeHTML, function(part, key){
        return dictionaryUnescapeHTML[key];
      });
    },
    /**
     * Alternatives:
     * http://sugarjs.com/api/String/escapeURL
     */
    escapeURL: function(component /* = false */){
      return (component ? encodeURIComponent : encodeURI)(this);
    },
    /**
     * Alternatives:
     * http://sugarjs.com/api/String/unescapeURL
     */
    unescapeURL: function(component /* = false */){
      return (component ? decodeURIComponent : decodeURI)(this);
    },
    /**
     * Alternatives:
     * http://sugarjs.com/api/String/escapeRegExp
     * http://api.prototypejs.org/language/RegExp/escape/
     * http://mootools.net/docs/core/Types/String#String:escapeRegExp
     */
    escapeRegExp: function(){
      return String(this).replace(RegExpEscapeRegExp, '\\$1');
    }
  });
}();

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
!function(formatRegExp, locales, current, getHours, getMonth){
  function format(template, lang /* = current */){
    var that   = this
      , locale = locales[lang && has(locales, lang) ? lang : current];
    return String(template).replace(formatRegExp, function(part){
      switch(part){
        case 'ms'   : return that.getMilliseconds();                            // Milliseconds : 1-999
        case 's'    : return that.getSeconds();                                 // Seconds      : 1-59
        case 'ss'   : return lz2(that.getSeconds());                            // Seconds      : 01-59
        case 'm'    : return that.getMinutes();                                 // Minutes      : 1-59
        case 'mm'   : return lz2(that.getMinutes());                            // Minutes      : 01-59
        case 'h'    : return that[getHours]()                                   // Hours        : 0-23
        case 'hh'   : return lz2(that[getHours]());                             // Hours        : 00-23
        case 'H'    : return that[getHours]() % 12 || 12;                       // Hours        : 1-12
        case 'HH'   : return lz2(that[getHours]() % 12 || 12);                  // Hours        : 01-12
        case 'a'    : return that[getHours]() < 12 ? 'AM' : 'PM';               // AM/PM
        case 'd'    : return that.getDate();                                    // Date         : 1-31
        case 'dd'   : return lz2(that.getDate());                               // Date         : 01-31
        case 'w'    : return locale.w[that.getDay()];                           // Day          : Понедельник
        case 'n'    : return that[getMonth]() + 1;                              // Month        : 1-12
        case 'nn'   : return lz2(that[getMonth]() + 1);                         // Month        : 01-12
        case 'M'    : return locale.M[that[getMonth]()];                        // Month        : Январь
        case 'MM'   : return locale.MM[that[getMonth]()];                       // Month        : Января
        case 'YY'   : return lz2(that.getFullYear() % 100);                     // Year         : 13
        case 'YYYY' : return that.getFullYear();                                // Year         : 2013
      }
      return part;
    });
  }
  function lz2(num){
    return num > 9 ? num : '0' + num;
  }
  function addLocale(lang, locale){
    locales[lang] = {
      w : array(locale.w),
      M : array(locale.M).map(flexio(0)),
      MM: array(locale.M).map(flexio(1))
    };
    return Date;
  }
  function flexio(index){
    return function(it){
      return it.replace(/\+(.+)$/, function(part, str){
        return str.split('|')[index];
      });
    }
  }
  $define(STATIC, 'Date', {
    locale: function(locale){
      if(has(locales, locale))current = locale;
      return current;
    },
    addLocale: addLocale
  });
  $define(PROTO, 'Date', {format: format});
  addLocale('en', {
    w: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
    M: 'January,February,March,April,May,June,July,August,September,October,November,December'
  });
  addLocale('ru', {
    w: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
    M: 'Январ+ь|я,Феврал+ь|я,Март+|а,Апрел+ь|я,Ма+й|я,Июн+ь|я,Июл+ь|я,Август+|а,Сентябр+ь|я,Октябр+ь|я,Ноябр+ь|я,Декабр+ь|я'
  });
}(/\b(\w\w*)\b/g, {}, 'en', 'getHours', 'getMonth');

/*****************************
 * Module : extendCollections
 *****************************/

/**
 * http://esdiscuss.org/topic/additional-set-prototype-methods
 * Alternatives:
 * https://github.com/calvinmetcalf/set.up (Firefox only)
 */
var extendCollections = {
  reduce: function(fn, memo){
    assertFunction(fn);
    this.forEach(function(val, key, foo){
      memo = fn(memo, val, key, foo);
    });
    return memo;
  },
  some: function(fn, that){
    assertFunction(fn);
    var iter = this.entries()
      , step, value;
    while(!(step = iter.next()).done){
      value = step.value;
      if(fn.call(that, value[1], value[0], this))return true;
    }
    return false;
  },
  every: function(fn, that){
    assertFunction(fn);
    var iter = this.entries()
      , step, value;
    while(!(step = iter.next()).done){
      value = step.value;
      if(!fn.call(that, value[1], value[0], this))return false;
    }
    return true;
  },
  find: function(fn, that){
    assertFunction(fn);
    var iter = this.entries()
      , step, value;
    while(!(step = iter.next()).done){
      value = step.value;
      if(fn.call(that, value[1], value[0], this))return value[1];
    }
  },
  toArray: function(){
    var index  = 0
      , result = Array(this.size);
    this.forEach(function(val){
      result[index++] = val;
    });
    return result;
  },
  reduceTo: function(target, fn){
    if(arguments.length < 2){
      fn = target;
      target = create(null);
    } else target = Object(target);
    this.forEach(part.call(fn, target));
    return target;
  }
};
$define(PROTO, 'Map', assign({
  map: function(fn, that){
    assertFunction(fn);
    var result = new Map;
    this.forEach(function(val, key){
      result.set(key, fn.apply(that, arguments));
    });
    return result;
  },
  filter: function(fn, that){
    assertFunction(fn);
    var result = new Map;
    this.forEach(function(val, key){
      if(fn.apply(that, arguments))result.set(key, val);
    });
    return result;
  },
  toObject: function(){
    var result = create(null);
    this.forEach(function(val, key){
      result[key] = val;
    });
    return result;
  },
  getKeys: function(){
    var index  = 0
      , result = Array(this.size);
    this.forEach(function(val, key){
      result[index++] = key;
    });
    return result;
  },
  invert: function(){
    var result = new Map;
    this.forEach(result.set, result);
    return result;
  }
}, extendCollections));
$define(PROTO, 'Set', assign({
  map: function(fn, that){
    assertFunction(fn);
    var result = new Set;
    this.forEach(function(){
      result.add(fn.apply(that, arguments));
    });
    return result;
  },
  filter: function(fn, that){
    assertFunction(fn);
    var result = new Set;
    this.forEach(function(val){
      if(fn.apply(that, arguments))result.add(val);
    });
    return result;
  }
}, extendCollections));

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
var $console = reduceTo.call(
  array('assert,count,clear,debug,dir,dirxml,error,exception,' +
    'group,groupCollapsed,groupEnd,info,log,table,trace,warn,' +
    'markTimeline,profile,profileEnd,time,timeEnd,timeStamp'),
  {enabled: true},
  function(memo, key){
    memo[key] = function(){
      return console[key] && $console.enabled ? apply.call(console[key], console, arguments) : undefined;
    };
  }
);
try {
  framework && delete global.console;
} catch(e){}
$define(GLOBAL, {console: $console = assign($console.log, $console)}, 1);
}(typeof window != 'undefined' ? window : global, true);