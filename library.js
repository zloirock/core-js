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
  , undescore = global._
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
var push     = $Array.push
  , unshift  = $Array.unshift
  , slice    = $Array.slice
  , $indexOf = unbind($Array.indexOf)
  , $forEach = unbind($Array.forEach)
  , $slice   = Array.slice || function(arrayLike, from){
      return slice.call(arrayLike, from);
    }
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

var forOf, isIterable, getIterator, objectIterators; // define in iterator module

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
    // create shortcuts in `_` for Object & Function static methods
    if(isStatic && (name == OBJECT || name == FUNCTION))_[key] = prop;
    // if build as fremework, extend global objects
    framework && target && !own && (isGlobal || delete target[key])
      && defineProperty(target, key, descriptor(6 + !isProto, source[key]));
  }
}
// wrap to prevent obstruction of the global constructors, when build as library
function wrapGlobalConstructor(Base){
  if(framework || !isNative(Base))return Base;
  function F(param){
    return this instanceof Base ? new Base(param) : Base(param);
  }
  F[PROTOTYPE] = Base[PROTOTYPE];
  return F;
}
// export `_`
var module    = global.module
  , isExports = module && module.exports;
if(isExports)module.exports = _;
if(!isExports || framework){
  _.noConflict = function(){
    global._ = undescore;
    return _;
  }
  global._ = _;
}

/*****************************
 * Module : es5
 *****************************/

/**
 * ECMAScript 5 shim
 * http://es5.github.io/
 * Alternatives:
 * https://github.com/es-shims/es5-shim
 * https://github.com/ddrcode/ddr-ecma5
 * http://augmentjs.com/
 * https://github.com/inexorabletash/polyfill/blob/master/es5.js
 */
!function(){
  var Empty              = Function()
    , whitespace         = '[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]'
    , trimRegExp         = RegExp('^' + whitespace + '+|' + whitespace + '+$', 'g')
    // for fix IE 8- don't enum bug https://developer.mozilla.org/en-US/docs/ECMAScript_DontEnum_attribute
    // http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
    , hiddenNames1       = array('toString,toLocaleString,valueOf,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,constructor')
    , hiddenNames2       = hiddenNames1.concat(['length'])
    , hiddenNames1Length = hiddenNames1.length
    , _slice             = slice
    , join               = $Array.join
    , _join              = join
    // Create object with null as it's prototype
    , createNullProtoObject = __PROTO__
      ? function(){
          return {__proto__: null};
        }
      : function(){
          // Thrash, waste and sodomy
          var iframe   = document.createElement('iframe')
            , i        = hiddenNames1Length
            , body     = document.body || document.documentElement
            , iframeDocument;
          iframe.style.display = 'none';
          body.appendChild(iframe);
          iframe.src = 'javascript:';
          iframeDocument = iframe.contentWindow.document || iframe.contentDocument || iframe.document;
          iframeDocument.open();
          iframeDocument.write('<script>document._=Object</script>');
          iframeDocument.close();
          createNullProtoObject = iframeDocument._;
          while(i--)delete createNullProtoObject[PROTOTYPE][hiddenNames1[i]];
          return createNullProtoObject();
        }
    , createGetKeys = function(names, length){
        return function(O){
          O = ES5Object(O);
          var i      = 0
            , result = []
            , key;
          for(key in O)has(O, key) && result.push(key);
          // hidden names for Object.getOwnPropertyNames & don't enum bug fix for Object.keys
          while(length > i)has(O, key = names[i++]) && !~$indexOf(result, key) && result.push(key);
          return result;
        }
      };
  // The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
  try {
    Object.defineProperty({}, 0, $Object);
  }
  catch(e){
    DESCRIPTORS = false;
    getOwnPropertyDescriptor = function(O, P){
      if(has(O, P))return descriptor(6 + isEnumerable.call(O, P), O[P]);
    };
    defineProperty = function(O, P, Attributes){
      assertObject(O);
      if('value' in Attributes)O[P] = Attributes.value;
      return O;
    };
    defineProperties = function(O, Properties){
      assertObject(O);
      var names  = keys(Properties)
        , length = names.length
        , i = 0
        , P, Attributes;
      while(length > i){
        P          = names[i++];
        Attributes = Properties[P];
        if('value' in Attributes)O[P] = Attributes.value;
      }
      return O;
    }
  }
  $define(STATIC, OBJECT, {
    // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
    getOwnPropertyDescriptor: getOwnPropertyDescriptor,
    // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
    defineProperty: defineProperty,
    // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties) 
    defineProperties: defineProperties
  }, 1);
  $define(STATIC, OBJECT, {
    // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O) 
    getPrototypeOf: function(O){
      var constructor
        , proto = O.__proto__ || ((constructor = O.constructor) ? constructor[PROTOTYPE] : $Object);
      return O !== proto && 'toString' in O ? proto : null;
    },
    // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: createGetKeys(hiddenNames2, hiddenNames2.length),
    // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
    create: function(O, /*?*/Properties){
      if(O === null)return Properties ? defineProperties(createNullProtoObject(), Properties) : createNullProtoObject();
      assertObject(O);
      Empty[PROTOTYPE] = O;
      var result = new Empty();
      if(Properties)defineProperties(result, Properties);
      // add __proto__ for Object.getPrototypeOf shim
      __PROTO__ || result.constructor[PROTOTYPE] === O || (result.__proto__ = O);
      return result;
    },
    // 19.1.2.14 / 15.2.3.14 Object.keys(O)
    keys: createGetKeys(hiddenNames1, hiddenNames1Length)
  });
  
  // not array-like strings fix
  if(!(0 in Object('q') && 'q'[0] == 'q')){
    ES5Object = function(it){
      return classof(it) == STRING ? it.split('') : Object(it);
    }
    slice = function(){
      return _slice.apply(ES5Object(this), arguments);
    }
    join = function(){
      return _join.apply(ES5Object(this), arguments);
    }
  }
  // fix for not array-like ES3 string
  $define(PROTO, ARRAY, {
    slice: slice,
    join: join
  }, 1);
  
  // 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg [, arg1 [, arg2, …]]) 
  $define(PROTO, FUNCTION, {
    bind: function(scope /*, args... */){
      var fn   = this
        , args = $slice(arguments, 1);
      assertFunction(fn);
      function bound(/* args... */){
        var _args = args.concat($slice(arguments))
          , result, that
        if(this instanceof fn)return isObject(result = apply.call(that = create(fn[PROTOTYPE]), scope, _args)) ? result : that;
        return apply.call(fn, scope, _args);
      }
      bound[PROTOTYPE] = undefined;
      return bound;
    }
  });
  
  // 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
  $define(STATIC, ARRAY, {isArray: function(arg){
    return classof(arg) == ARRAY
  }});
  $define(PROTO, ARRAY, {
    // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
    indexOf: function(searchElement, fromIndex /* = 0 */){
      var self   = ES5Object(this)
        , length = toLength(self.length)
        , i      = fromIndex | 0;
      if(0 > i)i = toLength(length + i);
      for(;length > i; i++)if(i in self && self[i] === searchElement)return i;
      return -1;
    },
    // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
    lastIndexOf: function(searchElement, fromIndex /* = @[*-1] */){
      var self   = ES5Object(this)
        , length = toLength(self.length)
        , i      = length - 1;
      if(arguments.length > 1)i = min(i, fromIndex | 0);
      if(0 > i)i = toLength(length + i);
      for(;i >= 0; i--)if(i in self && self[i] === searchElement)return i;
      return -1;
    },
    // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
    every: function(callbackfn, thisArg /* = undefined */){
      assertFunction(callbackfn);
      var self   = ES5Object(this)
        , length = toLength(self.length)
        , i      = 0;
      for(;length > i; i++){
        if(i in self && !callbackfn.call(thisArg, self[i], i, this))return false;
      }
      return true;
    },
    // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
    some: function(callbackfn, thisArg /* = undefined */){
      assertFunction(callbackfn);
      var self   = ES5Object(this)
        , length = toLength(self.length)
        , i      = 0;
      for(;length > i; i++){
        if(i in self && callbackfn.call(thisArg, self[i], i, this))return true;
      }
      return false;
    },
    // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
    forEach: function(callbackfn, thisArg /* = undefined */){
      assertFunction(callbackfn);
      var self   = ES5Object(this)
        , length = toLength(self.length)
        , i      = 0;
      for(;length > i; i++)i in self && callbackfn.call(thisArg, self[i], i, this);
    },
    // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
    map: function(callbackfn, thisArg /* = undefined */){
      assertFunction(callbackfn);
      var result = Array(toLength(this.length));
      $forEach(this, function(val, key, that){
        result[key] = callbackfn.call(thisArg, val, key, that);
      });
      return result;
    },
    // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
    filter: function(callbackfn, thisArg /* = undefined */){
      assertFunction(callbackfn);
      var result = [];
      $forEach(this, function(val){
        callbackfn.apply(thisArg, arguments) && result.push(val);
      });
      return result;
    },
    // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
    reduce: function(callbackfn, memo /* = @.0 */){
      assertFunction(callbackfn);
      var self   = ES5Object(this)
        , length = toLength(self.length)
        , i      = 0;
      if(2 > arguments.length)for(;;){
        if(i in self){
          memo = self[i++];
          break;
        }
        assert(length > ++i, REDUCE_ERROR);
      }
      for(;length > i; i++)if(i in self)memo = callbackfn(memo, self[i], i, this);
      return memo;
    },
    // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
    reduceRight: function(callbackfn, memo /* = @[*-1] */){
      assertFunction(callbackfn);
      var self = ES5Object(this)
        , i    = toLength(self.length) - 1;
      if(2 > arguments.length)for(;;){
        if(i in self){
          memo = self[i--];
          break;
        }
        assert(0 <= --i, REDUCE_ERROR);
      }
      for(;i >= 0; i--)if(i in self)memo = callbackfn(memo, self[i], i, this);
      return memo;
    }
  });
  
  // 21.1.3.25 / 15.5.4.20 String.prototype.trim()
  $define(PROTO, STRING, {trim: function(){
    return String(this).replace(trimRegExp, '');
  }});
  
  // 20.3.3.1 / 15.9.4.4 Date.now()
  $define(STATIC, 'Date', {now: function(){
    return +new Date;
  }});
  
  if(isFunction(trimRegExp))isFunction = function(it){
    return classof(it) == FUNCTION;
  }
  
  create              = _[OBJECT].create;
  getPrototypeOf      = _[OBJECT].getPrototypeOf;
  keys                = _[OBJECT].keys;
  getOwnPropertyNames = _[OBJECT].getOwnPropertyNames;
  $indexOf            = _[ARRAY].indexOf;
  $forEach            = _[ARRAY].forEach;
}();

/*****************************
 * Module : global
 *****************************/

$define(GLOBAL, {global: global});

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
  __PROTO__ && $define(STATIC, OBJECT, {
    // 19.1.3.19 Object.setPrototypeOf(O, proto)
    // work only if browser support __proto__, don't work with null proto objects
    setPrototypeOf: function(O, proto){
      assertObject(O);
      assert(isObject(proto) || proto === null, "Can't set", proto, 'as prototype');
      O.__proto__ = proto;
      return O;
    }
  });
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
        , i      = 0
        , length, iter, step;
      if(isIterable && isIterable(O)){
        iter = getIterator(O);
        while(!(step = iter.next()).done)push.call(result, mapfn ? mapfn.call(thisArg, step.value) : step.value);
      } else for(length = toLength(O.length); i < length; i++)push.call(result, mapfn ? mapfn.call(thisArg, O[i], i, O) : O[i]);
      return result;
    },
    // 22.1.2.3 Array.of( ...items)
    of: function(/*args...*/){
      var i      = 0
        , length = arguments.length
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
      if((start |= 0) < 0 && (start = length + start) < 0)return this;
      end = end == undefined ? length : end | 0;
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
  &&  Promise.cast && Promise.resolve && Promise.reject && Promise.all && Promise.race
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
    assign(Promise[PROTOTYPE], {
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
          if(remaining)$forEach(values, function(promise, i){
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
    Symbol[PROTOTYPE].toString = Symbol[PROTOTYPE].valueOf = function(){
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
  StringIterator[PROTOTYPE] = {
    next: function(){
      var iterated = this[ITERATED]
        , index    = this[INDEX]++;
      return index < iterated.length
        ? createIterResultObject(iterated.charAt(index), 0)
        : createIterResultObject(undefined, 1);
    }
  };
  
  function ArrayIterator(iterated, kind){
    this[ITERATED] = iterated;
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
        case KEY: return createIterResultObject(key, 0);
        case VALUE: return createIterResultObject(object[key], 0);
      }
      return createIterResultObject([key, object[key]], 0);
    }
  }
  
  StringIterator[PROTOTYPE][ITERATOR] = ArrayIterator[PROTOTYPE][ITERATOR] =
    MapIterator[PROTOTYPE][ITERATOR] = SetIterator[PROTOTYPE][ITERATOR] =
      ObjectIterator[PROTOTYPE][ITERATOR] = returnThis;
  
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
  
  $define(PROTO, ARRAY, {
    // 22.1.3.4 Array.prototype.entries()
    entries: createIteratorFactory(ArrayIterator, KEY+VALUE),
    // 22.1.3.13 Array.prototype.keys()
    keys: createIteratorFactory(ArrayIterator, KEY),
    // 22.1.3.29 Array.prototype.values()
    values: createIteratorFactory(ArrayIterator, VALUE)
  });
  $define(PROTO, MAP, {
    // 23.1.3.4 Map.prototype.entries()
    entries: createIteratorFactory(MapIterator, KEY+VALUE),
    // 23.1.3.8 Map.prototype.keys()
    keys: createIteratorFactory(MapIterator, KEY),
    // 23.1.3.11 Map.prototype.values()
    values: createIteratorFactory(MapIterator, VALUE)
  });
  $define(PROTO, SET, {
    // 23.2.3.5 Set.prototype.entries()
    entries: createIteratorFactory(SetIterator, KEY+VALUE),
    // 23.2.3.8 Set.prototype.keys()
    keys: createIteratorFactory(SetIterator, VALUE),
    // 23.2.3.10 Set.prototype.values()
    values: createIteratorFactory(SetIterator, VALUE)
  });
  
  if(framework){
    // 21.1.3.27 String.prototype[@@iterator]()
    defineIterator(String[PROTOTYPE], createIteratorFactory(StringIterator));
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
    keys: createObjectIteratorFactory(KEY),
    values: createObjectIteratorFactory(VALUE),
    entries: createObjectIteratorFactory(KEY+VALUE)
  }
  
  $define(GLOBAL, {forOf: forOf});
}();

/*****************************
 * Module : dict
 *****************************/

!function(){
  function Dict(props){
    return props ? assign(create(null), props) : create(null);
  }
  assign(Dict, objectIterators);
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
  assign(Dict, {
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
      } else target = Object(target);
      assertFunction(callbackfn);
      var O      = ES5Object(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i)callbackfn(target, O[key = props[i++]], key, object);
      return target;
    }
  });
  $define(GLOBAL, {Dict: Dict});
}();

/*****************************
 * Module : extendedObjectAPI
 *****************************/

/**
 * Extended object api from harmony and strawman :
 * http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
 * http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
 */
$define(STATIC, OBJECT, {
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
      $forEach(getOwnPropertyNames(object), function(key){
        ~$indexOf(result, key) || result.push(key);
      });
    }
    return result;
  }
});

/*****************************
 * Module : timers
 *****************************/

/**
 * ie9- setTimeout & setInterval additional parameters fix
 * http://www.w3.org/TR/html5/webappapis.html#timers
 * http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#timers
 * Alternatives:
 * https://developer.mozilla.org/ru/docs/Web/API/Window.setTimeout#IE_Only_Fix
 * http://underscorejs.org/#delay
 */
!function(navigator){
  function wrap(set){
    return function(fn, time /*, args...*/){
      return set(part.apply(isFunction(fn) ? fn : Function(fn), $slice(arguments, 2)), time || 1);
    }
  }
  // ie9- dirty check
  if(navigator && /MSIE .\./.test(navigator.userAgent)){
    setTimeout  = wrap(setTimeout);
    setInterval = wrap(setInterval);
  }
  $define(GLOBAL, {
    setTimeout: setTimeout,
    setInterval: setInterval
  }, 1);
}(global.navigator);

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
  // Modern browsers with native Promise
  } else if($Promise && isFunction($Promise.resolve)){
    defer = function(id){
      $Promise.resolve(id).then(run);
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
  this[PROTOTYPE] = create(parent[PROTOTYPE], getOwnPropertyDescriptors(this[PROTOTYPE]));
  return this;
}
$define(STATIC, FUNCTION, {
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
$define(PROTO, FUNCTION, {
  construct: function(args){
    assertFunction(this);
    var instance = create(this[PROTOTYPE])
      , result   = this.apply(instance, ES5Object(args));
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
    assign(Deferred[PROTOTYPE], {
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
  $define(PROTO, FUNCTION, {
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
  length = arguments.length;
  if(length < 2)return ctx(that[key], that);
  args = Array(length - 1)
  while(length > i)if((args[i - 1] = arguments[i++]) === _)placeholder = true;
  return createPartialApplication(that[key], args, length, placeholder, true, that);
}
function by(that){
  var fn = this
    , placeholder = false
    , length = arguments.length
    , i = 1, args;
  if(length < 2)return ctx(fn, that);
  args = Array(length - 1);
  while(length > i)if((args[i - 1] = arguments[i++]) === _)placeholder = true;
  return createPartialApplication(fn, args, length, placeholder, true, that);
}
$define(PROTO, FUNCTION, {
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
  by: by,
  /**
   * function -> method
   * Alternatives:
   * http://api.prototypejs.org/language/Function/prototype/methodize/
   */
  methodize: methodize
});
$define(PROTO, ARRAY, {tie: tie});
$define(PROTO, REGEXP, {tie: tie});
$define(STATIC, OBJECT, {
  /**
   * Alternatives:
   * http://www.2ality.com/2013/06/auto-binding.html
   * http://livescript.net/#property-access -> foo~bar
   * http://lodash.com/docs#bindKey
   */
  tie: unbind(tie),
  useTie: part.call($define, PROTO, OBJECT, {tie: tie})
});
$define(STATIC, FUNCTION, {
  part: unbind(part),
  by: unbind(by),
  tie: unbind(tie)
});

/*****************************
 * Module : object
 *****************************/

!function(){
  function define(target, source){
    return defineProperties(target, getOwnPropertyDescriptors(source));
  }
  function make(proto, props, desc){
    return props ? (desc ? define : assign)(create(proto), props) : create(proto);
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
    var already = $indexOf(stackA, object)
      , F       = object.constructor
      , result;
    if(~already)return stackB[already];
    switch(classof(object)){
      case 'Arguments' :
      case ARRAY       :
        result = Array(object.length);
        break;
      case FUNCTION    :
        return object;
      case REGEXP      :
        result = RegExp(object.source, String(object).match(/[^\/]*$/)[0]);
        break;
      case STRING      :
        return new F(object);
      case 'Boolean'   :
      case 'Date'      :
      case NUMBER      :
        result = new F(object.valueOf());
        break;
      /*
      case SET         :
        result = new F;
        object.forEach(result.add, result);
        break;
      case MAP         :
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
  $define(STATIC, OBJECT, {
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
    /**
     * 19.1.3.15 Object.mixin ( target, source ) <= Removed in Draft Rev 22, January 20, 2014, http://esdiscuss.org/topic/november-19-2013-meeting-notes#content-1
     */
    define: define,
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
    /**
     * Alternatives:
     * http://underscorejs.org/#isObject
     * http://sugarjs.com/api/Object/isType
     * http://docs.angularjs.org/api/angular.isObject
     */
    isObject: isObject,
    symbol: symbol,
    hidden: hidden
  });
}();

/*****************************
 * Module : array
 *****************************/

$define(PROTO, ARRAY, {
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
$define(STATIC, ARRAY, reduceTo.call(
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
$define(PROTO, NUMBER, reduceTo.call(
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
  $define(PROTO, STRING, {
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
      M : flexio(locale.M, 0),
      MM: flexio(locale.M, 1)
    };
    return Date;
  }
  function flexio(locale, index){
    var result = [];
    $forEach(array(locale), function(it){
      result.push(it.replace(/\+(.+)$/, function(part, str){
        return str.split('|')[index];
      }));
    });
    return result;
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
$define(PROTO, MAP, assign({
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
$define(PROTO, SET, assign({
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
  {
    enable: function(){
      enabled = true;
    },
    disable: function(){
      enabled = false;
    }
  },
  function(memo, key){
    memo[key] = function(){
      if(enabled && console[key])return apply.call(console[key], console, arguments);
    };
  }
), enabled = true;
try {
  framework && delete global.console;
} catch(e){}
$define(GLOBAL, {console: $console = assign($console.log, $console)}, 1);
}(typeof window != 'undefined' ? window : global, false);