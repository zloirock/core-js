/**
 * Core.js v0.0.6
 * http://core.zloirock.ru
 * © 2013 Denis Pushkarev
 * Available under MIT license
 */
!function(global, undefined){
'use strict';
/**
 * Module : global
 */
global.global = global;
/**
 * Module : init
 */
var prototype      = 'prototype'
  // Aliases global objects and prototypes
  , Function       = global.Function
  , Object         = global.Object
  , Array          = global.Array
  , String         = global.String
  , Number         = global.Number
  , RegExp         = global.RegExp
  , Date           = global.Date
  , Math           = global.Math
  , setTimeout     = global.setTimeout
  , clearTimeout   = global.clearTimeout
  , setInterval    = global.setInterval
  , setImmediate   = global.setImmediate
  , clearImmediate = global.clearImmediate
  , document       = global.document
  , Infinity       = 1 / 0
  , $Array         = Array[prototype]
  , $Number        = Number[prototype]
  , $Object        = Object[prototype]
  , $String        = String[prototype]
  , $Function      = Function[prototype];
  
// http://es5.github.io/#x9.12
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.is
var same = Object.is || function(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !==y;
}
// http://jsperf.com/core-js-isobject
function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
// fallback for regexps in older browsers in es5 shim
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
  , call  = $Function.call;
// unbind method from context
// foo.fn(arg1, arg2, ...) => fn(foo, arg1, arg2, ...)
function unbind(that){
  return tie.call(that, 'call');
}
// simple bind context
function tie(key){
  var that = this
    , fn   = that[key];
  return function(){
    return fn.apply(that, arguments);
  }
}
// placeholder for partial apply
var _ = {};
// partial apply
function part(/*args...*/){
  var fn          = this
    , lengthPart  = arguments.length
    , argsPart    = Array(lengthPart)
    , i           = 0
    , placeholder = false;
  while(lengthPart > i)if((argsPart[i] = arguments[i++]) === _)placeholder = true;
  return function(/*args...*/){
    var length = arguments.length
      , i, j, args;
    if(!placeholder && length === 0)return fn.apply(this, argsPart);
    args = argsPart.slice();
    i = j = 0;
    if(placeholder)for(;lengthPart > i; i++)if(args[i] === _)args[i] = arguments[j++]
    while(length > j)args.push(arguments[j++]);
    return fn.apply(this, args);
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
var isEnumerable   = $Object.propertyIsEnumerable
  , defineProperty = Object.defineProperty
  , PROTO          = '__proto__' in $Object
  , DESCRIPTORS    = 1;
function descriptor(bitmap, value){
  return {
    enumerable  : !!(bitmap & 1),
    configurable: !!(bitmap & 2),
    writable    : !!(bitmap & 4),
    value       : value
  }
}
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
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign
var assign = Object.assign || function(target, source){
  var props  = keys(source)
    , length = props.length
    , i      = 0
    , key;
  while(length > i)target[key = props[i++]] = source[key];
  return target;
}
function invert(object){
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
var push   = $Array.push
  , slice  = $Array.slice
  , $slice = Array.slice || function(arrayLike, from){
      return slice.call(arrayLike, from);
    };
// How to get the context for calling Array.prototype methods
// Dummy, polyfill for not array-like strings for old ie in es5 shim
var arrayLikeSelf = Object;
// simple reduce to object
function reduceTo(target, callbackfn){
  if(arguments.length < 2){
    callbackfn = target;
    target = {};
  } else target = Object(target);
  forEach.call(this, callbackfn, target);
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
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tointeger
var toInteger = Number.toInteger || function(it){
  return (it = +it) != it ? 0 : it != 0 && it != Infinity && it != -Infinity ? (it > 0 ? floor : ceil)(it) : it;
}
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
function toLength(it){
  return it > 0 ? min(toInteger(it), MAX_SAFE_INTEGER) : 0;
}

// Assertion & errors:
var REDUCE_ERROR   = 'Reduce of empty object with no initial value';
function assert(condition, message){
  if(!condition)throw TypeError(message);
}
function assertInstance(that, constructor, name){
  assert(that instanceof constructor, name + ": Please use the 'new' operator");
}

function extendBuiltInObject(target, source, forced /* = false */){
  if(target)for(var key in source){
    try {
      has(source, key)
      && (forced || !has(target, key) || !isNative(target[key]))
      && delete target[key]
      && defineProperty(target, key, descriptor(6, source[key]));
    } catch(e){}
  }
  return target
}
function hidden(key){
  return key + '_' + random().toString(36).slice(2);
}
/**
 * Module : es5
 */
/**
 * ECMAScript 5 shim
 * Alternatives:
 * https://github.com/es-shims/es5-shim
 * https://github.com/ddrcode/ddr-ecma5
 * http://augmentjs.com/
 * https://github.com/inexorabletash/polyfill/blob/master/es5.js
 */
!function(){
  var Empty             = Function()
    , whitespace        = '[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]'
    , trimRegExp        = RegExp('^' + whitespace + '+|' + whitespace + '+$', 'g')
    // for fix IE 8- don't enum bug https://developer.mozilla.org/en-US/docs/ECMAScript_DontEnum_attribute
    // http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
    , hidenNames1       = array('toString,toLocaleString,valueOf,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,constructor')
    , hidenNames2       = hidenNames1.concat(['length'])
    , hidenNames1Length = hidenNames1.length
    , nativeSlice       = slice
    , nativeJoin        = $Array.join
    // Create object with null as it's prototype
    , createNullProtoObject = PROTO
      ? function(){
          return {__proto__: null};
        }
      : function(){
          // Thrash, waste and sodomy
          var iframe   = document.createElement('iframe')
            , i        = hidenNames1Length
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
          while(i--)delete createNullProtoObject[prototype][hidenNames1[i]];
          return createNullProtoObject();
        }
    , createGetKeys = function(names, length){
        return function(O){
          var i      = 0
            , result = []
            , key;
          for(key in O)has(O, key) && result.push(key);
          // hiden names for Object.getOwnPropertyNames & don't enum bug fix for Object.keys
          while(length > i)has(O, key = names[i++]) && !~result.indexOf(key) && result.push(key);
          return result;
        }
      };
  // The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
  try {
    defineProperty({}, 0, $Object);
  }
  catch(e){
    DESCRIPTORS = 0;
    /**
     * 15.2.3.3 Object.getOwnPropertyDescriptor ( O, P )
     * http://es5.github.io/#x15.2.3.3
     */
    Object.getOwnPropertyDescriptor = function(O, P){
      if(has(O, P))return descriptor(6 + isEnumerable.call(O, P), O[P]);
    };
    /**
     * 15.2.3.6 Object.defineProperty ( O, P, Attributes )
     * http://es5.github.io/#x15.2.3.6
     */
    Object.defineProperty = defineProperty = function(O, P, Attributes){
      O[P] = Attributes.value;
      return O;
    };
    /**
     * 15.2.3.7 Object.defineProperties ( O, Properties ) 
     * http://es5.github.io/#x15.2.3.7
     */
    Object.defineProperties = function(O, Properties){
      // IE 9- don't enum bug => Object.keys
      var names  = keys(Properties)
        , length = names.length
        , i = 0
        , key;
      while(length > i)O[key = names[i++]] = Properties[key].value;
      return O;
    }
  }
  extendBuiltInObject(Object, {
    /**
     * 15.2.3.2 Object.getPrototypeOf ( O ) 
     * http://es5.github.io/#x15.2.3.2
     */
    getPrototypeOf: function(O){
      var constructor
        , proto = O.__proto__ || ((constructor = O.constructor) ? constructor[prototype] : $Object);
      return O !== proto && 'toString' in O ? proto : null;
    },
    /**
     * 15.2.3.4 Object.getOwnPropertyNames ( O )
     * http://es5.github.io/#x15.2.3.4
     */
    getOwnPropertyNames: createGetKeys(hidenNames2, hidenNames2.length),
    /**
     * 15.2.3.5 Object.create ( O [, Properties] )
     * http://es5.github.io/#x15.2.3.5
     */
    create: function(O, /*?*/Properties){
      if(O === null)return Properties ? defineProperties(createNullProtoObject(), Properties) : createNullProtoObject();
      assert(isObject(O), 'Object prototype may only be an object or null');
      Empty[prototype] = O;
      var result = new Empty();
      if(Properties)defineProperties(result, Properties);
      // add __proto__ for Object.getPrototypeOf shim
      PROTO || result.constructor[prototype] === O || (result.__proto__ = O);
      return result;
    },
    /**
     * 15.2.3.14 Object.keys ( O )
     * http://es5.github.io/#x15.2.3.14
     */
    keys: createGetKeys(hidenNames1, hidenNames1Length)
  });
  // not array-like strings fix
  if(!(0 in Object('q') && 'q'[0] == 'q')){
    arrayLikeSelf = function(it){
      return classof(it) == 'String' ? it.split('') : Object(it);
    }
    // Array.prototype methods for strings in ES3
    $Array.slice = slice = function(){
      return nativeSlice.apply(arrayLikeSelf(this), arguments);
    }
    $Array.join = function(){
      return nativeJoin.apply(arrayLikeSelf(this), arguments);
    }
  }
  /**
   * 15.3.4.5 Function.prototype.bind (thisArg [, arg1 [, arg2, …]]) 
   * http://es5.github.io/#x15.3.4.5
   */
  extendBuiltInObject($Function, {
    bind: function(scope /*, args...*/){
      var fn   = this
        , args = $slice(arguments, 1);
      assert(isFunction(fn), fn + ' is not a function');
      function bound(){
        return apply.call(fn, this instanceof fn ? this : scope, args.concat($slice(arguments)));
      }
      bound[prototype] = create(fn[prototype]);
      return bound;
    }
  });
  /**
   * 15.4.3.2 Array.isArray ( arg )
   * http://es5.github.io/#x15.4.3.2
   * Alternatives:
   * http://underscorejs.org/#isArray
   * http://sugarjs.com/api/Object/isType
   * http://api.prototypejs.org/language/Object/isArray/
   * http://nodejs.org/api/util.html#util_util_isarray_object
   * http://api.jquery.com/jQuery.isArray/
   * http://docs.angularjs.org/api/angular.isArray
   */
  extendBuiltInObject(Array, {isArray: function(it){
    return classof(it) == 'Array'
  }});
  function forEach(callbackfn, thisArg /* = undefined */){
    var self   = arrayLikeSelf(this)
      , length = toLength(self.length)
      , i      = 0;
    for(;length > i; i++)i in self && callbackfn.call(thisArg, self[i], i, this);
  }
  extendBuiltInObject($Array, {
    /**
     * 15.4.4.14 Array.prototype.indexOf ( searchElement [ , fromIndex ] )
     * http://es5.github.io/#x15.4.4.14
     */
    indexOf: function(searchElement, fromIndex /* = 0 */){
      var self   = arrayLikeSelf(this)
        , length = toLength(self.length)
        , i      = fromIndex | 0;
      if(0 > i)i = toLength(length + i);
      for(;length > i; i++)if(i in self && self[i] === searchElement)return i;
      return -1;
    },
    /**
     * 15.4.4.15 Array.prototype.lastIndexOf ( searchElement [ , fromIndex ] )
     * http://es5.github.io/#x15.4.4.15
     */
    lastIndexOf: function(searchElement, fromIndex /* = @[*-1] */){
      var self   = arrayLikeSelf(this)
        , length = toLength(self.length)
        , i      = length - 1;
      if(arguments.length > 1)i = min(i, fromIndex | 0);
      if(0 > i)i = toLength(length + i);
      for(;i >= 0; i--)if(i in self && self[i] === searchElement)return i;
      return -1;
    },
    /**
     * 15.4.4.16 Array.prototype.every ( callbackfn [ , thisArg ] )
     * http://es5.github.io/#x15.4.4.16
     */
    every: function(callbackfn, thisArg /* = undefined */){
      var self   = arrayLikeSelf(this)
        , length = toLength(self.length)
        , i      = 0;
      for(;length > i; i++){
        if(i in self && !callbackfn.call(thisArg, self[i], i, this))return false;
      }
      return true;
    },
    /**
     * 15.4.4.17 Array.prototype.some ( callbackfn [ , thisArg ] )
     * http://es5.github.io/#x15.4.4.17
     */
    some: function(callbackfn, thisArg /* = undefined */){
      var self   = arrayLikeSelf(this)
        , length = toLength(self.length)
        , i      = 0;
      for(;length > i; i++){
        if(i in self && callbackfn.call(thisArg, self[i], i, this))return true;
      }
      return false;
    },
    /**
     * 15.4.4.18 Array.prototype.forEach ( callbackfn [ , thisArg ] )
     * http://es5.github.io/#x15.4.4.18
     */
    forEach: forEach,
    /**
     * 15.4.4.19 Array.prototype.map ( callbackfn [ , thisArg ] )
     * http://es5.github.io/#x15.4.4.19
     */
    map: function(callbackfn, thisArg /* = undefined */){
      var rez = Array(toLength(this.length));
      forEach.call(this, function(val, key, that){
        rez[key] = callbackfn.call(thisArg, val, key, that);
      });
      return rez;
    },
    /**
     * 15.4.4.20 Array.prototype.filter ( callbackfn [ , thisArg ] )
     * http://es5.github.io/#x15.4.4.20
     */
    filter: function(callbackfn, thisArg /* = undefined */){
      var rez = [];
      forEach.call(this, function(val){
        callbackfn.apply(thisArg, arguments) && rez.push(val);
      });
      return rez;
    },
    /**
     * 15.4.4.21 Array.prototype.reduce ( callbackfn [ , initialValue ] )
     * http://es5.github.io/#x15.4.4.21
     */
    reduce: function(callbackfn, memo /* = @.1 */){
      var self   = arrayLikeSelf(this)
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
    /**
     * 15.4.4.22 Array.prototype.reduceRight ( callbackfn [ , initialValue ] )
     * http://es5.github.io/#x15.4.4.22
     */
    reduceRight: function(callbackfn, memo /* = @[*-1] */){
      var self = arrayLikeSelf(this)
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
  /**
   * 15.5.4.20 String.prototype.trim ( )
   * http://es5.github.io/#x15.5.4.20
   */
  extendBuiltInObject($String, {trim: function(){
    return String(this).replace(trimRegExp, '');
  }});
  /**
   * 15.9.4.4 Date.now ( )
   * http://es5.github.io/#x15.9.4.4
   */
  extendBuiltInObject(Date, {now: function(){
    return +new Date;
  }});
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#Regular_expressions
  if(isFunction(trimRegExp))isFunction = function(it){
    return classof(it) == 'Function';
  }
}();
/**
 * Module : resume
 */
var create                   = Object.create
  , defineProperties         = Object.defineProperties
  , getPrototypeOf           = Object.getPrototypeOf
  , keys                     = Object.keys
  , getOwnPropertyNames      = Object.getOwnPropertyNames
  , getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
  , forEach                  = $Array.forEach
  , isArray                  = Array.isArray
  , map                      = $Array.map;
/**
 * Module : immediateInternal
 */
/**
 * setImmediate
 * https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
 * http://nodejs.org/api/timers.html#timers_setimmediate_callback_arg
 * Alternatives:
 * https://github.com/NobleJS/setImmediate
 * https://github.com/calvinmetcalf/immediate
 */
// Node.js setImmediate & clearImmediate are not [native code]
var isSetImmediate = isFunction(setImmediate) && isFunction(clearImmediate);
// Node.js 0.9+ & IE10+ has setImmediate, else:
isSetImmediate || !function(process, postMessage, MessageChannel, onreadystatechange){
  var IMMEDIATE_PREFIX = hidden('immediate')
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
  // IE8 has postMessage, but it's sync & typeof it's postMessage is object
  } else if(isFunction(postMessage) && !global.importScripts){
    defer = function(id){
      postMessage(id, '*');
    }
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel();
    channel.port1.onmessage = listner;
    defer = tie.call(channel.port2, 'postMessage');
  // IE8-
  // use DOM => use after onload
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
  } else defer = function(id){
      setTimeout(part.call(run, id), 0);
    }
}(global.process, global.postMessage, global.MessageChannel, 'onreadystatechange');
/**
 * Module : es6
 */
/**
 * ECMAScript 6 shim
 * http://people.mozilla.org/~jorendorff/es6-draft.html
 * http://wiki.ecmascript.org/doku.php?id=harmony:proposals
 * Alternatives:
 * https://github.com/paulmillr/es6-shim
 * https://github.com/monolithed/ECMAScript-6
 * https://github.com/inexorabletash/polyfill/blob/master/harmony.js
 */
!function(){
  function sign(it){
    return (it = +it) == 0 || it != it ? it : it < 0 ? -1 : 1;
  }
  function izFinite(it){
    return typeof it == 'number' && isFinite(it);
  }
  extendBuiltInObject(Object, {
    /**
     * 19.1.3.1 Object.assign ( target, source )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign
     * http://kangax.github.io/es5-compat-table/es6/#Object.assign
     * http://www.2ality.com/2014/01/object-assign.html
     */
    assign: assign,
    /**
     * 19.1.3.10 Object.is ( value1, value2 )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.is
     * http://wiki.ecmascript.org/doku.php?id=harmony:egal
     * http://kangax.github.io/es5-compat-table/es6/#Object.is
     */
    is: same
  });
  /**
   * 19.1.3.19 Object.setPrototypeOf ( O, proto )
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.setprototypeof
   * http://kangax.github.io/es5-compat-table/es6/#Object.setPrototypeOf
   * work only if browser support __proto__, don't work with null proto objects
   */
  PROTO && extendBuiltInObject(Object, {
    setPrototypeOf: function(O, proto){
      assert(isObject(O) && (isObject(proto) || proto === null), "Can't set " + proto + ' as prototype of ' + O);
      O.__proto__ = proto;
      return O;
    }
  });
  extendBuiltInObject(Number, {
    /**
     * 20.1.2.1 Number.EPSILON
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.epsilon
     * http://wiki.ecmascript.org/doku.php?id=harmony:number_epsilon
     */
    EPSILON: 2.220446049250313e-16,
    /**
     * 20.1.2.2 Number.isFinite (number)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isfinite
     * http://wiki.ecmascript.org/doku.php?id=harmony:number.isfinite
     * http://kangax.github.io/es5-compat-table/es6/#Number.isFinite
     */
    isFinite: izFinite,
    /**
     * 20.1.2.3 Number.isInteger (number)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isinteger
     * http://wiki.ecmascript.org/doku.php?id=harmony:number.isinteger
     * http://kangax.github.io/es5-compat-table/es6/#Number.isInteger
     */
    isInteger: function(it){
      return izFinite(it) && floor(it) === it;
    },
    /**
     * 20.1.2.4 Number.isNaN (number)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isnan
     * http://wiki.ecmascript.org/doku.php?id=harmony:number.isnan
     * http://kangax.github.io/es5-compat-table/es6/#Number.isNaN
     */
    isNaN: function(number){
      return typeof number == 'number' && number != number;
    },
    /**
     * 20.1.2.5 Number.isSafeInteger (number)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.issafeinteger
     */
    isSafeInteger: function(number){
      return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
    },
    /**
     * 20.1.2.6 Number.MAX_SAFE_INTEGER
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer
     */
    MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
    /**
     * 20.1.2.10 Number.MIN_SAFE_INTEGER
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.min_safe_integer
     */
    MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
    /**
     * 20.1.2.12 Number.parseFloat (string)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.parsefloat
     */
    parseFloat: parseFloat,
    /***
     * 20.1.2.13 Number.parseInt (string, radix)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.parseint
     */
    parseInt: parseInt
  });
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isinteger
  var isInteger = Number.isInteger
    , isFinite  = global.isFinite
    , abs       = Math.abs
    , exp       = Math.exp
    , ln        = Math.log
    , sqrt      = Math.sqrt;
  extendBuiltInObject(Math, {
    /**
     * 20.2.2.3 Math.acosh(x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.acosh
     * http://kangax.github.io/es5-compat-table/es6/#Math.acosh
     * Returns an implementation-dependent approximation to the inverse hyperbolic cosine of x.
     */
    acosh: function(x){
      return ln(x + sqrt(x * x - 1));
    },
    /***
     * 20.2.2.5 Math.asinh(x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.asinh
     * http://kangax.github.io/es5-compat-table/es6/#Math.asinh
     * Returns an implementation-dependent approximation to the inverse hyperbolic sine of x.
     */
    asinh: function(x){
      return !isFinite(x = +x) || x === 0 ? x : ln(x + sqrt(x * x + 1));
    },
    /**
     * 20.2.2.7 Math.atanh(x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.atanh
     * http://kangax.github.io/es5-compat-table/es6/#Math.atanh
     * Returns an implementation-dependent approximation to the inverse hyperbolic tangent of x.
     */
    atanh: function(x){
      return x === 0 ? x : 0.5 * ln((1 + x) / (1 - x));
    },
    /**
     * 20.2.2.9 Math.cbrt(x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.cbrt
     * Returns an implementation-dependent approximation to the cube root of x.
     */
    cbrt: function(x){
      return sign(x) * pow(abs(x), 1/3);
    },
    /**
     * 20.1.3.1 Number.prototype.clz ()
     * Rename to Math.clz32 <= http://esdiscuss.org/topic/january-19-meeting-notes#content-31
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.prototype.clz
     * http://kangax.github.io/es5-compat-table/es6/#Number.prototype.clz
     */
    clz32: function(number){
      number = number >>> 0;
      return number ? 32 - number.toString(2).length : 32;
    },
    /**
     * 20.2.2.12 Math.cosh(x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.cosh
     * http://kangax.github.io/es5-compat-table/es6/#Math.cosh
     * Returns an implementation-dependent approximation to the hyperbolic cosine of x.
     */
    cosh: function(x){
      return (exp(x) + exp(-x)) / 2;
    },
    /**
     * 20.2.2.14 Math.expm1 (x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.expm1
     * http://kangax.github.io/es5-compat-table/es6/#Math.expm1
     * Returns an implementation-dependent approximation to subtracting 1 from the exponential function of x 
     */
    expm1: function(x){
      return same(x, -0) ? -0 : x > -1.0e-6 && x < 1.0e-6 ? x + x * x / 2 : exp(x) - 1;
    },
    /**
     * 20.2.2.16 Math.fround (x)
     */
    /*fround: function(x){
      
    },*/
    /**
     * 20.2.2.17 Math.hypot([ value1 [ , value2 [ , … ] ] ] )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.hypot
     * http://kangax.github.io/es5-compat-table/es6/#Math.hypot
     * Math.hypot returns an implementation-dependent approximation of the square root of the sum of squares of its arguments.
     */
    hypot: function(value1, value2){
      var sum    = 0
        , length = arguments.length
        , val;
      while(length--){
        val = +arguments[length];
        if(val == Infinity || val == - Infinity)return Infinity;
        sum += val * val;
      }
      return sqrt(sum);
    },
    /**
     * 20.2.2.18 Math.imul(x, y)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.imul
     * http://kangax.github.io/es5-compat-table/es6/#Math.imul
     */
    imul: function(x, y){
      var xh = (x >>> 0x10) & 0xffff
        , xl = x & 0xffff
        , yh = (y >>> 0x10) & 0xffff
        , yl = y & 0xffff;
      return xl * yl + (((xh * yl + xl * yh) << 0x10) >>> 0) | 0;
    },
    /**
     * 20.2.2.20 Math.log1p (x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.log1p
     * http://kangax.github.io/es5-compat-table/es6/#Math.log1p
     * Returns an implementation-dependent approximation to the natural logarithm of 1 + x.
     * The result is computed in a way that is accurate even when the value of x is close to zero.
     */
    log1p: function(x){
      return (x > -1.0e-8 && x < 1.0e-8) ? (x - x * x / 2) : ln(1 + x);
    },
    /**
     * 20.2.2.21 Math.log10 (x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.log10
     * http://kangax.github.io/es5-compat-table/es6/#Math.log10
     * Returns an implementation-dependent approximation to the base 10 logarithm of x.
     */
    log10: function(x){
      return ln(x) / Math.LN10;
    },
    /**
     * 20.2.2.22 Math.log2 (x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.log2
     * http://kangax.github.io/es5-compat-table/es6/#Math.log2
     * Returns an implementation-dependent approximation to the base 2 logarithm of x.
     */
    log2: function(x){
      return ln(x) / Math.LN2;
    },
    /**
     * 20.2.2.28 Math.sign(x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.sign
     * http://kangax.github.io/es5-compat-table/es6/#Math.sign
     * Returns the sign of the x, indicating whether x is positive, negative or zero.
     */
    sign: sign,
    /**
     * 20.2.2.30 Math.sinh(x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.sinh
     * http://kangax.github.io/es5-compat-table/es6/#Math.sinh
     * Returns an implementation-dependent approximation to the hyperbolic sine of x.
     */
    sinh: function(x){
      return ((x = +x) == -Infinity) || x == 0 ? x : (exp(x) - exp(-x)) / 2;
    },
    /**
     * 20.2.2.33 Math.tanh(x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.tanh
     * http://kangax.github.io/es5-compat-table/es6/#Math.tanh
     * Returns an implementation-dependent approximation to the hyperbolic tangent of x.
     */
    tanh: function(x){
      return isFinite(x = +x) ? x == 0 ? x : (exp(x) - exp(-x)) / (exp(x) + exp(-x)) : sign(x);
    },
    /**
     * 20.2.2.34 Math.trunc(x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.trunc
     * http://kangax.github.io/es5-compat-table/es6/#Math.trunc
     * Returns the integral part of the number x, removing any fractional digits. If x is already an integer, the result is x.
     */
    trunc: function(x){
      return (x = +x) == 0 ? x : (x > 0 ? floor : ceil)(x);
    }
  });
  /*
  extendBuiltInObject(String, {
    // 21.1.2.2 String.fromCodePoint ( ...codePoints)
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.fromcodepoint
    // http://kangax.github.io/es5-compat-table/es6/#String.fromCodePoint
    fromCodePoint: function(){ TODO },
    // 21.1.2.4 String.raw ( callSite, ...substitutions)
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.raw
    raw: function(){ TODO }
  });
  */
  extendBuiltInObject($String, {
    /**
     * 21.1.3.3 String.prototype.codePointAt (pos)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype.codepointat
     * http://kangax.github.io/es5-compat-table/es6/#String.prototype.codePointAt
     */
    //codePointAt: function(pos /* = 0 */){

    //},
    /**
     * 21.1.3.6 String.prototype.contains (searchString, position = 0 )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype.contains
     * http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/contains
     * http://kangax.github.io/es5-compat-table/es6/#String.prototype.contains
     */
    contains: function(searchString, position /* = 0 */){
      return !!~String(this).indexOf(searchString, position);
    },
    /**
     * 21.1.3.7 String.prototype.endsWith (searchString [, endPosition] )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype.endswith
     * http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
     * http://kangax.github.io/es5-compat-table/es6/#String.prototype.endsWith
     */
    endsWith: function(searchString, endPosition /* = @length */){
      var length = this.length;
      searchString += '';
      endPosition = toLength(min(endPosition === undefined ? length : endPosition, length));
      return String(this).slice(endPosition - searchString.length, endPosition) === searchString;
    },
    /**
     * 21.1.3.13 String.prototype.repeat (count)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype.repeat
     * http://wiki.ecmascript.org/doku.php?id=harmony:string.prototype.repeat
     * http://kangax.github.io/es5-compat-table/es6/#String.prototype.repeat
     */
    repeat: function(count){
      assert(0 <= (count |= 0)); // TODO: add message
      return Array(count + 1).join(this);
    },
    /**
     * 21.1.3.18 String.prototype.startsWith (searchString [, position ] )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype.startswith
     * http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
     * http://kangax.github.io/es5-compat-table/es6/#String.prototype.startsWith
     */
    startsWith: function(searchString, position /* = 0 */){
      searchString += '';
      position = toLength(min(position, this.length));
      return String(this).slice(position, position + searchString.length) === searchString;
    }
  });
  extendBuiltInObject(Array, {
    /**
     * 22.1.2.1 Array.from ( arrayLike , mapfn=undefined, thisArg=undefined )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
     * http://wiki.ecmascript.org/doku.php?id=strawman:array_extras
     * http://kangax.github.io/es5-compat-table/es6/#Array.from
     */
    from: function(arrayLike, mapfn /* -> it */, thisArg /* = undefind */){
      var O = arrayLikeSelf(arrayLike)
        , i = 0
        , length = toLength(O.length)
        , result = new (isFunction(this) ? this : Array)(length);
      for(; i < length; i++)result[i] = mapfn ? mapfn.call(thisArg, O[i], i, O) : O[i];
      return result;
    },
    /**
     * 22.1.2.3 Array.of ( ...items )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.of
     * http://wiki.ecmascript.org/doku.php?id=strawman:array_extras
     * http://kangax.github.io/es5-compat-table/es6/#Array.of
     */
    of: function(/*args...*/){
      var i = 0
        , length = arguments.length
        , result = new (isFunction(this) ? this : Array)(length);
      while(i < length)result[i] = arguments[i++];
      return result;
    }
  });
  extendBuiltInObject($Array, {
    /**
     * 22.1.3.3 Array.prototype.copyWithin (target, start, end = this.length)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.prototype.copywithin
    copyWithin: function(target, start, end){

    },
     */
    /**
     * 22.1.3.6 Array.prototype.fill (value, start = 0, end = this.length)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.prototype.fill
     * http://wiki.ecmascript.org/doku.php?id=strawman:array_fill_and_move
     * http://kangax.github.io/es5-compat-table/es6/#Array.prototype.fill
     */
    fill: function(value, start /* = 0 */, end /* = @length */){
      var length = toLength(this.length);
      if((start |= 0) < 0 && (start = length + start) < 0)return this;
      end = end == undefined ? length : end | 0;
      while(end > start)this[start++] = value;
      return this;
    },
    /**
     * 22.1.3.8 Array.prototype.find ( predicate , thisArg = undefined )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.prototype.find
     * http://kangax.github.io/es5-compat-table/es6/#Array.prototype.find
     */
    find: function(predicate, thisArg /* = undefind */){
      var O = Object(this)
        , self = arrayLikeSelf(O)
        , length = toLength(self.length)
        , val, i = 0;
      for(; i < length; i++){
        if(i in self && predicate.call(thisArg, val = self[i], i, O))return val;
      }
    },
    /**
     * 22.1.3.9 Array.prototype.findIndex ( predicate , thisArg = undefined )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.prototype.findindex
     * http://kangax.github.io/es5-compat-table/es6/#Array.prototype.findIndex
     */
    findIndex: function(predicate, thisArg /* = undefind */){
      var O = Object(this)
        , self = arrayLikeSelf(O)
        , length = toLength(self.length)
        , i = 0;
      for(; i < length; i++){
        if(i in self && predicate.call(thisArg, self[i], i, O))return i;
      }
      return -1;
    }
  });
}();
/**
 * Module : es6c
 */
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
!function(Map, Set, WeakMap, WeakSet){
  var STOREID      = hidden('storeid')
    , KEYS_STORE   = hidden('keys')
    , VALUES_STORE = hidden('values')
    , WEAKDATA     = hidden('weakdata')
    , WEAKID       = hidden('weakid')
    , SIZE         = DESCRIPTORS ? hidden('size') : 'size'
    , uid          = 0
    , wid          = 0
    , tmp          = {}
    , sizeGetter   = {
        size: {
          get: function(){
            return this[SIZE];
          }
        }
      };
  function createCollectionConstructor(key, isSet){
    function F(iterable){
      assertInstance(this, F, key);
      this.clear();
      isSet && isArray(iterable) && iterable.forEach(this.add, this);
    }
    return F;
  }
  // fix Set & WeakSet constructors for init array
  function fixCollectionConstructor(Base, key){
    function F(iterable){
      assertInstance(this, F, key);
      var that = new Base;
      isArray(iterable) && iterable.forEach(that.add, that);
      return that;
    }
    F[prototype] = Base[prototype];
    return F;
  }
  // fix .add & .set for chaining
  function fixAdd(Collection, key){
    var collection = new Collection;
    if(collection[key](tmp, 1) !== collection){
      var fn = collection[key];
      defineProperty(Collection[prototype], key, descriptor(6, function(){
        fn.apply(this, arguments);
        return this;
      }));
    }
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
      var values = this[VALUES_STORE]
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
    return fastKey(key) in this[VALUES_STORE];
  }
  function clearSet(){
    defineProperty(this, VALUES_STORE, descriptor(6, create(null)));
    defineProperty(this, SIZE, descriptor(4, 0));
  }
  /**
   * 23.1 Map Objects
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map-objects
   */
  if(!isNative(Map) || !has(Map[prototype], 'forEach')){
    global.Map = Map = createCollectionConstructor('Map');
    extendBuiltInObject(Map[prototype], {
      /**
       * 23.1.3.1 Map.prototype.clear ()
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map.prototype.clear
       */
      clear: function(){
        defineProperty(this, KEYS_STORE, descriptor(6, create(null)));
        clearSet.call(this);
      },
      /**
       * 23.1.3.3 Map.prototype.delete ( key )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map.prototype.delete
       */
      'delete': function(key){
        var index    = fastKey(key)
          , values   = this[VALUES_STORE]
          , contains = index in values;
        if(contains){
          delete this[KEYS_STORE][index];
          delete values[index];
          this[SIZE]--;
        }
        return contains;
      },
      /**
       * 23.1.3.5 Map.prototype.forEach ( callbackfn , thisArg = undefined )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map.prototype.foreach
       */
      forEach: createForEach(KEYS_STORE),
      /**
       * 23.1.3.6 Map.prototype.get ( key )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map.prototype.get
       */
      get: function(key){
        return this[VALUES_STORE][fastKey(key)];
      },
      /**
       * 23.1.3.7 Map.prototype.has ( key )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map.prototype.has
       */
      has: collectionHas,
      /**
       * 23.1.3.9 Map.prototype.set ( key , value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map.prototype.set
       */
      set: function(key, value){
        var index  = fastKey(key, 1)
          , values = this[VALUES_STORE];
        if(!(index in values)){
          this[KEYS_STORE][index] = key;
          this[SIZE]++;
        }
        values[index] = value;
        return this;
      }
    });
    /**
     * 23.1.3.10 get Map.prototype.size
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-get-map.prototype.size
     */
    defineProperties(Map[prototype], sizeGetter);
  } else fixAdd(Map, 'set');
  /**
   * 23.2 Set Objects
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-set-objects
   */
  if(!isNative(Set) || !has(Set[prototype], 'forEach')){
    global.Set = Set = createCollectionConstructor('Set', 1);
    extendBuiltInObject(Set[prototype], {
      /**
       * 23.2.3.1 Set.prototype.add ( value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-set.prototype.add
       */
      add: function(value){
        var index  = fastKey(value, 1)
          , values = this[VALUES_STORE];
        if(!(index in values)){
          values[index] = value;
          this[SIZE]++;
        }
        return this;
      },
      /**
       * 23.2.3.2 Set.prototype.clear ()
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-set.prototype.clear
       */
      clear: clearSet,
      /**
       * 23.2.3.4 Set.prototype.delete ( value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-set.prototype.delete
       */
      'delete': function(value){
        var index    = fastKey(value)
          , values   = this[VALUES_STORE]
          , contains = index in values;
        if(contains){
          delete values[index];
          this[SIZE]--;
        }
        return contains;
      },
      /**
       * 23.2.3.6 Set.prototype.forEach ( callbackfn , thisArg = undefined )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-set.prototype.foreach
       */
      forEach: createForEach(VALUES_STORE),
      /**
       * 23.2.3.7 Set.prototype.has ( value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-set.prototype.has
       */
      has: collectionHas
    });
    /**
     * 23.2.3.9 get Set.prototype.size
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-get-set.prototype.size
     */
    defineProperties(Set[prototype], sizeGetter);
  } else {
    // IE 11 fix
    if(new Set([1]).size != 1)global.Set = fixCollectionConstructor(Set, 'Set');
    fixAdd(Set, 'add');
  }
  function getWeakData(it){
    return (has(it, WEAKDATA) ? it : defineProperty(it, WEAKDATA, {value: {}}))[WEAKDATA];
  }
  function assertObject(foo){
    isObject(foo) || assert(0, foo + ' is not an object'); // {__proto__: null} + '' => Error
  }
  var commonWeakCollection = {
    /**
     * 23.3.3.1 WeakMap.prototype.clear ()
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakmap.prototype.clear
     * 23.4.3.2 WeakSet.prototype.clear ()
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakset.prototype.clear
     */
    clear: function(){
      defineProperty(this, WEAKID, descriptor(6, wid++));
    },
    /**
     * 23.3.3.3 WeakMap.prototype.delete ( key )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakmap.prototype.delete
     * 23.4.3.4 WeakSet.prototype.delete ( value )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakset.prototype.delete
     */
    'delete': function(key){
      return this.has(key) && has(key, WEAKDATA) ? delete key[WEAKDATA][this[WEAKID]] : false;
    },
    /**
     * 23.3.3.5 WeakMap.prototype.has ( key )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakmap.prototype.has
     * 23.4.3.5 WeakSet.prototype.has ( value )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakset.prototype.has
     */
    has: function(key){
      return isObject(key) && has(key, WEAKDATA) && has(key[WEAKDATA], this[WEAKID]);
    }
  };
  /**
   * 23.3 WeakMap Objects
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakmap-objects
   */
  if(!isNative(WeakMap) || !has(WeakMap[prototype], 'clear')){
    global.WeakMap = WeakMap = createCollectionConstructor('WeakMap');
    extendBuiltInObject(WeakMap[prototype], assign({
      /**
       * 23.3.3.4 WeakMap.prototype.get ( key )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakmap.prototype.get
       */
      get: function(key){
        return isObject(key) && has(key, WEAKDATA) ? key[WEAKDATA][this[WEAKID]] : undefined;
      },
      /**
       * 23.3.3.6 WeakMap.prototype.set ( key , value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakmap.prototype.set
       */
      set: function(key, value){
        assertObject(key);
        getWeakData(key)[this[WEAKID]] = value;
        return this;
      }
    }, commonWeakCollection));
  } else fixAdd(WeakMap, 'set');
  /**
   * 23.4 WeakSet Objects
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakset-objects
   */
  if(!isNative(WeakSet)){
    global.WeakSet = WeakSet = createCollectionConstructor('WeakSet', 1);
    extendBuiltInObject(WeakSet[prototype], assign({
      /**
       * 23.4.3.1 WeakSet.prototype.add (value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-weakset.prototype.add
       */
      add: function(value){
        assertObject(value);
        getWeakData(value)[this[WEAKID]] = true;
        return this;
      }
    }, commonWeakCollection));
  } else {
    // v8 fix
    if(!new WeakSet([tmp]).has(tmp))global.WeakSet = fixCollectionConstructor(WeakSet, 'WeakSet');
    fixAdd(WeakSet, 'add');
  }
}(global.Map, global.Set, global.WeakMap, global.WeakSet);
/**
 * Module : promise
 */
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
  isNative(Promise)
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
      , SUBSCRIBERS = hidden('subscribers')
      , STATE       = hidden('state')
      , DETAIL      = hidden('detail')
      , ITERABLE_ERROR = 'You must pass an array to race or all';
    // https://github.com/domenic/promises-unwrapping#the-promise-constructor
    function Promise(resolver){
      var promise       = this
        , rejectPromise = part.call(handle, promise, REJECTED);
      assert(isFunction(resolver), 'First argument of Promise constructor must be an function');
      assertInstance(promise, Promise, 'Promise');
      promise[SUBSCRIBERS] = [];
      try {
        resolver(part.call(resolve, promise), rejectPromise);
      } catch(e){
        rejectPromise(e);
      }
    }
    global.Promise = Promise;
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
      /**
       * 25.4.5.1 Promise.prototype.catch ( onRejected )
       * https://github.com/domenic/promises-unwrapping#promiseprototypecatch--onrejected-
       */
      'catch': function(onRejected){
        return this.then(undefined, onRejected);
      },
      /**
       * 25.4.5.3 Promise.prototype.then ( onFulfilled , onRejected )
       * https://github.com/domenic/promises-unwrapping#promiseprototypethen--onfulfilled--onrejected-
       */
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
      /**
       * 25.4.4.1 Promise.all ( iterable )
       * https://github.com/domenic/promises-unwrapping#promiseall--iterable-
       */
      all: function(iterable){
        assert(isArray(iterable), ITERABLE_ERROR);
        return new this(function(resolve, reject){
          var results   = []
            , remaining = iterable.length;
          function resolveAll(index, value){
            results[index] = value;
            --remaining || resolve(results);
          }
          if(remaining)iterable.forEach(function(promise, i){
            promise && isFunction(promise.then)
              ? promise.then(part.call(resolveAll, i), reject)
              : resolveAll(i, promise);
          });
          else resolve(results);
        });
      },
      /**
       * 25.4.4.2 Promise.cast ( x )
       * https://github.com/domenic/promises-unwrapping#promisecast--x-
       */
      cast: function(x){
        return x instanceof this ? x : $resolve.call(this, x);
      },
      /**
       * 25.4.4.4 Promise.race ( iterable )
       * https://github.com/domenic/promises-unwrapping#promiserace--iterable-
       */
      race: function(iterable){
        assert(isArray(iterable), ITERABLE_ERROR);
        return new this(function(resolve, reject){
          iterable.forEach(function(promise){
            promise && isFunction(promise.then)
              ? promise.then(resolve, reject)
              : resolve(promise);
          });
        });
      },
      /**
       * 25.4.4.5 Promise.reject ( r )
       * https://github.com/domenic/promises-unwrapping#promisereject--r-
       */
      reject: function(r){
        return new this(function(resolve, reject){
          reject(r);
        });
      },
      /**
       * 25.4.4.6 Promise.resolve ( x )
       * https://github.com/domenic/promises-unwrapping#promiseresolve--x-
       */
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
        assert(promise !== value, 'A promises callback cannot return that same promise.');
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
}(global.Promise);
/**
 * Module : extendedObjectAPI
 */
/**
 * Extended object api from harmony and strawman :
 * http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
 * http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
 */
extendBuiltInObject(Object, {
  getPropertyDescriptor: function(object, key){
    if(key in object)do {
      if(has(object, key))return getOwnPropertyDescriptor(object, key);
    } while(object = getPrototypeOf(object));
  },
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
/**
 * Module : timers
 */
/**
 * ie9- setTimeout & setInterval additional parameters fix
 * on ie8- work only as (global|window).setTimeout, instead of setTimeout
 * http://www.w3.org/TR/html5/webappapis.html#timers
 * http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#timers
 * Alternatives:
 * https://developer.mozilla.org/ru/docs/Web/API/Window.setTimeout#IE_Only_Fix
 */
!function(navigator){
  function wrap(set){
    return function(fn, time /*, args...*/){
      return set(part.apply(isFunction(fn) ? fn : Function(fn), $slice(arguments, 2)), time || 1);
    }
  }
  // ie9- dirty check
  if(navigator && /MSIE .\./.test(navigator.userAgent)){
    global.setTimeout  = wrap(setTimeout);
    global.setInterval = wrap(setInterval);
  }
}(global.navigator);
/**
 * Module : immediate
 */
/**
 * setImmediate
 * https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
 * http://nodejs.org/api/timers.html#timers_setimmediate_callback_arg
 * Alternatives:
 * https://github.com/NobleJS/setImmediate
 * https://github.com/calvinmetcalf/immediate
 */
if(!isSetImmediate){
  global.setImmediate = setImmediate;
  global.clearImmediate = clearImmediate;
}
/**
 * Module : function
 */
function inherits(parent){
  this[prototype] = create(parent[prototype], getOwnPropertyDescriptors(this[prototype]));
  return this;
}
extendBuiltInObject(Function, {
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
extendBuiltInObject($Function, {
  invoke: function(args){
    var instance = create(this[prototype])
      , result   = this.apply(instance, arrayLikeSelf(args || []));
    return isObject(result) ? result : instance;
  },
  // deferred call
  /**
   * Alternatives:
   * http://underscorejs.org/#delay
   * http://sugarjs.com/api/Function/delay
   * http://api.prototypejs.org/language/Function/prototype/delay/
   * http://mootools.net/docs/core/Types/Function#Function:delay
   */
  timeout: function(del /*, args...*/){
    return createDeferred(setTimeout, clearTimeout, [part.apply(this, $slice(arguments, 1)), del]);
  },
  /**
   * Alternatives:
   * http://sugarjs.com/api/Function/every
   * http://mootools.net/docs/core/Types/Function#Function:periodical
   */
  interval: function(del /*, args...*/){
    return createDeferred(setInterval, clearInterval, [part.apply(this, $slice(arguments, 1)), del]);
  },
  /**
   * Alternatives:
   * http://underscorejs.org/#defer
   * http://api.prototypejs.org/language/Function/prototype/defer/
   */
  immediate: function(/*, args...*/){
    return createDeferred(setImmediate, clearImmediate, [part.apply(this, arguments)]);
  },
  /**
   * Alternatives:
   * http://nodejs.org/api/util.html#util_util_inherits_constructor_superconstructor
   */
  inherits: inherits
});
function createDeferred(set, clear, args){
  var deferred = {
    stop: function(){
      id && clear(id);
      return deferred;
    },
    run: function(){
      id && clear(id);
      id = apply.call(set, global, args);
      return deferred;
    }
  }, id;
  return deferred;
}
/**
 * Module : binding
 */
extendBuiltInObject($Function, {
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
  /**
   * function -> method
   * Alternatives:
   * http://api.prototypejs.org/language/Function/prototype/methodize/
   */
  methodize: methodize,
  /**
   * http://www.wirfs-brock.com/allen/posts/166
   * http://habrahabr.ru/post/114737/
   */
  only: function(numberArguments/*?*/, that){
    numberArguments |= 0;
    var fn     = this
      , isThat = arguments.length > 1;
    return function(/*args...*/){
      return fn.apply(isThat ? that : this, slice.call(arguments, 0, min(numberArguments, arguments.length)));
    }
  }
});
extendBuiltInObject($Array, {tie: tie});
extendBuiltInObject(RegExp[prototype], {tie: tie});
extendBuiltInObject(Object, {
  /**
   * Alternatives:
   * http://livescript.net/#property-access -> foo~bar
   * http://lodash.com/docs#bindKey
   */
  tie: unbind(tie),
  /**
   * Alternatives:
   * http://www.2ality.com/2013/06/auto-binding.html
   */
  useTie: part.call(extendBuiltInObject, $Object, {tie: tie})
});
/**
 * Module : object
 */
!function(){
  function make(proto, props){
    return create(proto, props ? getOwnPropertyDescriptors(props) : undefined);
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
      case'Boolean'   :
      case'String'    :
      case'Number'    : return a.valueOf() == b.valueOf();
      case'RegExp'    : return '' + a == '' + b;
      case'Error'     : return a.message == b.message;/*
      case'Array'     :
      case'Arguments' :
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
  function forOwnKeys(object, fn, that /* = undefined */){
    var O      = arrayLikeSelf(object)
      , props  = keys(O)
      , length = props.length
      , i      = 0
      , key;
    while(length > i)fn.call(that, O[key = props[i++]], key, object);
    return object;
  }
  function findIndex(object, fn, that /* = undefined */){
    var O      = arrayLikeSelf(object)
      , props  = keys(O)
      , length = props.length
      , i      = 0
      , key;
    while(length > i){
      if(fn.call(that, O[key = props[i++]], key, object))return key;
    }
  }
  extendBuiltInObject(Object, {
    /**
     * Alternatives:
     * http://underscorejs.org/#has
     * http://sugarjs.com/api/Object/has
     */
    isEnumerable: unbind(isEnumerable),
    isPrototype: unbind($Object.isPrototypeOf),
    has: has,
    get: function(object, key){
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
    mixin: function(target, source){
      return defineProperties(target, getOwnPropertyDescriptors(source));
    },
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
      var O      = arrayLikeSelf(object)
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
      var O      = arrayLikeSelf(object)
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
      return index === undefined ? undefined : object[index];
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
    forEach: forOwnKeys,
    /**
     * Alternatives:
     * http://mootools.net/docs/core/Types/Object#Object:Object-keyOf
     */
    indexOf: function(object, searchElement){
      var O      = arrayLikeSelf(object)
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
      var O      = arrayLikeSelf(object)
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
      var O      = arrayLikeSelf(object)
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
      var O      = arrayLikeSelf(object)
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
      object = arrayLikeSelf(object);
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
      forOwnKeys(object, callbackfn, target);
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
    isEqual: part.call(isEqual, _, _, [], [])
  });
}();
/**
 * Module : array
 */
extendBuiltInObject($Array, {
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
    var that   = arrayLikeSelf(this)
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
    push.apply(this, arrayLikeSelf(arrayLike));
    return this;
  }
});
/**
 * Module : arrayStatics
 */
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
extendBuiltInObject(Array, reduceTo.call(
  // IE...
  // getOwnPropertyNames($Array),
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
  function(key){
    if(key in $Array)this[key] = unbind($Array[key]);
  }
));
/**
 * Module : number
 */
extendBuiltInObject(Number, {
  /**
   * Alternatives:
   * http://mootools.net/docs/core/Types/Number#Number:toInt
   */
  toInteger: toInteger
});
extendBuiltInObject($Number, {
  /**
   * Alternatives:
   * http://underscorejs.org/#times
   * http://sugarjs.com/api/Number/times
   * http://api.prototypejs.org/language/Number/prototype/times/
   * http://mootools.net/docs/core/Types/Number#Number:times
   */
  times: function(fn, that /* = undefined */){
    var number = toLength(this)
      , result = Array(number)
      , i      = 0;
    if(isFunction(fn))while(number > i)result[i] = fn.call(that, i, i++, this);
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
 * Alternatives:
 * http://sugarjs.com/api/Number/math
 * http://mootools.net/docs/core/Types/Number#Number-Math
 */
extendBuiltInObject($Number, reduceTo.call(
  // IE...
  // getOwnPropertyNames(Math)
  array(
    // ES3
    'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,pow,sqrt,max,min,pow,atan2,' +
    // ES6
    'acosh,asinh,atanh,cbrt,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc'
  ),
  function(key){
    if(key in Math)this[key] = methodize.call(Math[key]);
  }
));
/**
 * Module : string
 */
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
    , RegExpEscapeHTML = RegExp('[' + keys(dictionaryEscapeHTML).join('') + ']', 'g')
    , RegExpUnescapeHTML = RegExp('(' + keys(dictionaryUnescapeHTML).join('|') + ')', 'g')
    , RegExpEscapeRegExp = /([\\\/'*+?|()\[\]{}.^$])/g;
  extendBuiltInObject($String, {
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
/**
 * Module : date
 */
/**
 * Alternatives:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
 * https://github.com/andyearnshaw/Intl.js
 * http://momentjs.com/
 * http://habrahabr.ru/post/204162/
 * http://sugarjs.com/api/Date/format
 * http://mootools.net/docs/more/Types/Date#Date:format
 */
!function(){
  function format(template, lang /* = current */){
    var that   = this
      , locale = locales[lang && has(locales, lang) ? lang : current];
    return String(template).replace(formatRegExp, function(part, key){
      switch(key){
        case 'ms'   : return that.getMilliseconds();          // mSec    : 1-999
        case 's'    : return that.getSeconds();               // Seconds : 1-59
        case 'ss'   : return lz2(that.getSeconds());          // Seconds : 01-59
        case 'm'    : return that.getMinutes();               // Minutes : 1-59
        case 'mm'   : return lz2(that.getMinutes());          // Minutes : 01-59
        case 'h'    : return that.getHours()                  // Hours   : 0-23
        case 'hh'   : return lz2(that.getHours());            // Hours   : 00-23
        case 'H'    : return that.getHours() % 12 || 12;      // Hours   : 1-12
        case 'HH'   : return lz2(that.getHours() % 12 || 12); // Hours   : 01-12
        case 'd'    : return that.getDate();                  // Date    : 1-31
        case 'dd'   : return lz2(that.getDate());             // Date    : 01-31
        case 'w'    : return locale.w[that.getDay()];         // Day     : Понедельник
        case 'n'    : return that.getMonth() + 1;             // Month   : 1-12
        case 'nn'   : return lz2(that.getMonth() + 1);        // Month   : 01-12
        case 'M'    : return locale.M[that.getMonth()];       // Month   : Январь
        case 'MM'   : return locale.MM[that.getMonth()];      // Month   : Января
        case 'yy'   : return lz2(that.getFullYear() % 100);   // Year    : 13
        case 'yyyy' : return that.getFullYear();              // Year    : 2013
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
  }
  function flexio(index){
    return function(it){
      return it.replace(/\+(.+)$/, function(part, str){
        return str.split('|')[index];
      });
    }
  }
  var formatRegExp = /\b(\w\w*)\b/g
    , current = 'en'
    , locales = {};
  extendBuiltInObject(Date, {
    locale: function(locale){
      if(has(locales, locale))current = locale;
      return current;
    },
    addLocale: addLocale
  });
  extendBuiltInObject(Date[prototype], {format: format});
  addLocale('en', {
    w: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
    M: 'January,February,March,April,May,June,July,August,September,October,November,December'
  });
  addLocale('ru', {
    w: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
    M: 'Январ+ь|я,Феврал+ь|я,Март+|а,Апрел+ь|я,Ма+й|я,Июн+ь|я,Июл+ь|я,Август+|а,Сентябр+ь|я,Октябр+ь|я,Ноябр+ь|я,Декабр+ь|я'
  });
}();
/**
 * Module : extendCollections
 */
/**
 * http://esdiscuss.org/topic/additional-set-prototype-methods
 * Alternatives:
 * https://github.com/calvinmetcalf/set.up (Firefox only)
 */
var extendCollections = {
  reduce: function(fn, memo){
    this.forEach(function(val, key, foo){
      memo = fn(memo, val, key, foo);
    });
    return memo;
  },
  some: function(fn, that){
    var DONE = {};
    try {
      this.forEach(function(val, key, foo){
        if(fn.call(that, val, key, foo))throw DONE;
      });
    } catch(error){
      if(error === DONE)return true;
      else throw error;
    }
    return false;
  },
  every: function(fn, that){
    var DONE = {};
    try {
      this.forEach(function(val, key, foo){
        if(!fn.call(that, val, key, foo))throw DONE;
      });
    } catch(error){
      if(error === DONE)return false;
      else throw error;
    }
    return true;
  },
  find: function(fn, that){
    var DONE = {};
    try {
      this.forEach(function(val, key, foo){
        if(fn.call(that, val, key, foo)){
          DONE.value = val;
          throw DONE;
        }
      });
    } catch(error){
      if(error === DONE)return DONE.value;
      else throw error;
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
    this.forEach(fn, target);
    return target;
  }
};
extendBuiltInObject(Map[prototype], assign({
  map: function(fn, that){
    var result = new Map;
    this.forEach(function(val, key){
      result.set(key, fn.apply(that, arguments));
    });
    return result;
  },
  filter: function(fn, that){
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
extendBuiltInObject(Set[prototype], assign({
  map: function(fn, that){
    var result = new Set;
    this.forEach(function(){
      result.add(fn.apply(that, arguments));
    });
    return result;
  },
  filter: function(fn, that){
    var result = new Set;
    this.forEach(function(val){
      if(fn.apply(that, arguments))result.add(val);
    });
    return result;
  }
}, extendCollections));
/**
 * Module : console
 */
/**
 * https://developer.mozilla.org/en-US/docs/Web/API/console
 * https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
 * Alternatives:
 * https://github.com/paulmillr/console-polyfill
 * https://github.com/theshock/console-cap
 */
var _console = global.console || {}
  , $console = reduceTo.call(
      array('assert,count,clear,debug,dir,dirxml,error,exception,' +
        'group,groupCollapsed,groupEnd,info,log,table,trace,warn,' +
        'markTimeline,profile,profileEnd,time,timeEnd,timeStamp'),
      {enabled: true},
      function(key){
        this[key] = function(){
          return _console[key] && $console.enabled ? apply.call(_console[key], _console, arguments) : undefined;
        };
      }
    );
try {
  delete global.console;
} catch(e){}
$console = global.console = assign($console.log, $console);
}(typeof window != 'undefined' ? window : global);