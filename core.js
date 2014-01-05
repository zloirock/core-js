/**
 * Core.js v0.0.3
 * http://core.zloirock.ru
 * © 2013 Denis Pushkarev
 * Available under MIT license
 */
!function(global, Function, Object, Array, String, Number, RegExp, Date, TypeError, Math, isFinite, undefined){
'use strict';
// Module : global
global.global = global;
// Module : init
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
  , toString       = 'toString'
  // Unbind Object.prototype methods
  , _hasOwnProperty = $Object.hasOwnProperty
  , _toString       = $Object[toString]
  , _isPrototypeOf  = $Object.isPrototypeOf
  , _propertyIsEnumerable = $Object.propertyIsEnumerable
  , has = function(it, key){
      return _hasOwnProperty.call(it, key)
    }
  , $toString    = function(it){
      return _toString.call(it)
    }
  , isPrototype  = function(it, object){
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
// Module : stringInt
var trimWS = '[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]'
  , LTrim  = '^' + trimWS + trimWS + '*'
  , RTrim  = trimWS + trimWS + '*$';
// Module : es5
!function(){
  // not enum keys
  var Empty             = Function()
    , LTrimRegExp       = RegExp(LTrim)
    , RTrimRegExp       = RegExp(RTrim)
    // for fix IE 8- don't enum bug https://developer.mozilla.org/en-US/docs/ECMAScript_DontEnum_attribute
    , hidenNames1       = splitComma(toString + ',toLocaleString,valueOf,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,constructor')
    , hidenNames2       = hidenNames1.concat(['length'])
    , hidenNames1Length = hidenNames1.length
    , nativeSlice       = slice
    , nativeJoin        = $Array.join
    // Create object with null as it's prototype
    , createNullProtoObject = protoInObject()
      ? function(){
          return {__proto__: null}
        }
      : function(){
          // Thrash, waste and sodomy
          var iframe = document.createElement('iframe')
            , i      = hidenNames1Length
            , body   = document.body || document.documentElement
            , iframeDocument;
          iframe.style.display = 'none';
          body.appendChild(iframe);
          iframe.src = 'javascript:';
          iframeDocument = iframe.contentWindow.document || iframe.contentDocument || iframe.document;
          iframeDocument.open();
          iframeDocument.write('<script>document._=Object</script>');
          iframeDocument.close();
          createNullProtoObject = iframeDocument._;
          // body.removeChild(iframe);
          while(i--)delete createNullProtoObject[prototype][hidenNames1[i]];
          return createNullProtoObject()
        }
    , createGetKeys = function(names, length){
        return function(O){
          var i      = 0
            , result = []
            , key;
          for(key in O)has(O, key) && result.push(key);
          // hiden names for Object.getOwnPropertyNames & don't enum bug fix for Object.keys
          while(length > i)has(O, key = names[i++]) && !~result[indexOf](key) && result.push(key);
          return result
        }
      }
    // The engine has a guaranteed way to get a prototype?
    , $PROTO = !!Object.getPrototypeOf || protoInObject();
  // The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
  try {
    defineProperty({}, 0, $Object);
    $DESC = true;
  }
  catch(e){
    $DESC = false;
    /**
     * 15.2.3.3 Object.getOwnPropertyDescriptor ( O, P )
     * http://es5.github.io/#x15.2.3.3
     */
    Object.getOwnPropertyDescriptor = function(O, P){
      if(has(O, P))return descriptor(6 + isEnumerable(O, P), O[P])
    };
    /**
     * 15.2.3.6 Object.defineProperty ( O, P, Attributes )
     * http://es5.github.io/#x15.2.3.6
     */
    Object.defineProperty = defineProperty = function(O, P, Attributes){
      O[P] = Attributes.value;
      return O
    };
    /**
     * 15.2.3.7 Object.defineProperties ( O, Properties ) 
     * http://es5.github.io/#x15.2.3.7
     */
    Object.defineProperties = function(O, Properties){
      // IE 9- don't enum bug => Object.keys
      var names = keys(Properties)
        , length = names.length
        , i = 0
        , key;
      while(length > i)O[key = names[i++]] = Properties[key].value;
      return O
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
      return O != proto && toString in O ? proto : null
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
      if(!isObject(O))throw TypeError('Object prototype may only be an Object or null');
      Empty[prototype] = O;
      var result = new Empty();
      if(Properties)defineProperties(result, Properties);
      // add __proto__ for Object.getPrototypeOf shim
      $PROTO || result.constructor[prototype] == O || (result.__proto__ = O);
      return result
    },
    /**
     * 15.2.3.14 Object.keys ( O )
     * http://es5.github.io/#x15.2.3.14
     */
    keys: createGetKeys(hidenNames1, hidenNames1Length)
  });
  // not array-like strings fix
  if(!(0 in Object('q'))){
    arrayLikeSelf = function(it){
      return isString(it) ? it.split('') : Object(it)
    };
    // Array.prototype methods for strings in ES3
    $Array.slice = slice = function(){
      return nativeSlice.apply(arrayLikeSelf(this), arguments)
    };
    $Array.join = function(){
      return nativeJoin.apply(arrayLikeSelf(this), arguments)
    }
  }
  /**
   * 15.3.4.5 Function.prototype.bind (thisArg [, arg1 [, arg2, …]]) 
   * http://es5.github.io/#x15.3.4.5
   */
  extendBuiltInObject($Function, {
    bind:function(scope /*, args...*/){
      var fn   = this
        , args = slice1(arguments);
      function bound(){
        return apply.call(fn, fn[prototype] && this instanceof fn ? this : scope, args.concat(toArray(arguments)))
      }
      bound[prototype] = fn[prototype];
      return bound
    }
  });
  /**
   * 15.4.3.2 Array.isArray ( arg )
   * http://es5.github.io/#x15.4.3.2
   */
  extendBuiltInObject(Array, {isArray: isArray});
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
      return -1
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
      for(; i >= 0; i--)if(i in self && self[i] === searchElement)return i;
      return -1
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
      return true
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
      return false
    },
    /**
     * 15.4.4.18 Array.prototype.forEach ( callbackfn [ , thisArg ] )
     * http://es5.github.io/#x15.4.4.18
     */
    forEach: function(callbackfn, thisArg /* = undefined */){
      var self   = arrayLikeSelf(this)
        , length = toLength(self.length)
        , i      = 0;
      for(;length > i; i++)i in self && callbackfn.call(thisArg, self[i], i, this)
    },
    /**
     * 15.4.4.19 Array.prototype.map ( callbackfn [ , thisArg ] )
     * http://es5.github.io/#x15.4.4.19
     */
    map: function(callbackfn, thisArg /* = undefined */){
      var self   = arrayLikeSelf(this)
        , length = toLength(self.length)
        , rez    = Array(length)
        , i      = 0;
      for(;length > i; i++){
        if(i in self)rez[i] = callbackfn.call(thisArg, self[i], i, this);
      }
      return rez
    },
    /**
     * 15.4.4.20 Array.prototype.filter ( callbackfn [ , thisArg ] )
     * http://es5.github.io/#x15.4.4.20
     */
    filter: function(callbackfn, thisArg /* = undefined */){
      var self   = arrayLikeSelf(this)
        , length = toLength(self.length)
        , i      = 0
        , rez    = [];
      for(;length > i; i++){
        i in self
        && callbackfn.call(thisArg, self[i], i, this)
        && rez.push(self[i]);
      }
      return rez
    },
    /**
     * 15.4.4.21 Array.prototype.reduce ( callbackfn [ , initialValue ] )
     * http://es5.github.io/#x15.4.4.21
     */
    reduce: function(callbackfn, memo /* = @.1 */){
      var self   = arrayLikeSelf(this)
        , length = toLength(self.length)
        , i      = 0;
      if(2 > arguments.length)while(true){
        if(i in self){
          memo = self[i++];
          break
        }
        if(length <= ++i)throw TypeError(REDUCE_ERROR)
      }
      for(;length > i; i++)if(i in self)memo = callbackfn(memo, self[i], i, this);
      return memo
    },
    /**
     * 15.4.4.22 Array.prototype.reduceRight ( callbackfn [ , initialValue ] )
     * http://es5.github.io/#x15.4.4.22
     */
    reduceRight: function(callbackfn, memo /* = @[*-1] */){
      var self = arrayLikeSelf(this)
        , i    = toLength(self.length) - 1;
      if(2 > arguments.length)while(true){
        if(i in self){
          memo = self[i--];
          break
        }
        if(0 > --i)throw TypeError(REDUCE_ERROR)
      }
      for(;i >= 0; i--)if(i in self)memo = callbackfn(memo, self[i], i, this);
      return memo
    }
  });
  /**
   * 15.5.4.20 String.prototype.trim ( )
   * http://es5.github.io/#x15.5.4.20
   */
  extendBuiltInObject($String, {trim: function(){
    return String(this).replace(LTrimRegExp, '').replace(RTrimRegExp, '')
  }});
  /**
   * 15.9.4.4 Date.now ( )
   * http://es5.github.io/#x15.9.4.4
   */
  extendBuiltInObject(Date, {now: function(){
    return +new Date
  }});
  // IE isArguments fix
  isArguments(Function('return arguments')()) || (isArguments = function(it){
    return !!(it && isFunction(it.callee))
  });
}();
// Module : resume
var create                   = Object.create
  , defineProperties         = Object.defineProperties
  , getPrototypeOf           = Object.getPrototypeOf
  , keys                     = Object.keys
  , getOwnPropertyNames      = Object.getOwnPropertyNames
  , getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
  , some                     = $Array.some
  , forEach                  = $Array.forEach
  , map                      = $Array.map
  , indexOf                  = 'indexOf';
// Module : functionInt
// partiall apply
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
// unbind method from context
function unbind(){
  return ctx.call(call, this);
}
/**
 * add `this` as first argument
 * Number.prototype.pow = Math.pow.methodize()
 * 2 .pow(8) => 256
 */
function methodize(){
  var fn = this;
  return function(/*args...*/){
    var i = 0
      , length = arguments.length
      , args = Array(length + 1);
    args[0] = this;
    while(length > i)args[i + 1] = arguments[i++];
    return apply.call(fn, undefined, args)
  }
}
function ctx(that){
  var fn = this;
  return function(){
    return fn.apply(that, arguments);
  }
}
// Module : objectInt
// http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
function getPropertyDescriptor(object, key){
  if(key in object)do{
    if(has(object, key))return getOwnPropertyDescriptor(object, key)
  }while(object = getPrototypeOf(object))
}
// http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
function getOwnPropertyDescriptors(object){
  var result = {}
    , names  = getOwnPropertyNames(object)
    , length = names.length
    , i      = 0
    , key;
  while(length > i)result[key = names[i++]] = getOwnPropertyDescriptor(object, key);
  return result
}
function invert(object){
  var result = {}
    , key;
  for(key in object)has(object, key) && (result[object[key]] = key);
  return result;
}
function isObject(it){
  return it === Object(it)
}
function isString(it){
  return $toString(it) == '[object String]'
}
function isFunction(it){
  return $toString(it) == '[object Function]'
}
function isDate(it){
  return $toString(it) == '[object Date]'
}
// IE fix in es5.js
function isArguments(it){
  return $toString(it) == '[object Arguments]'
}
var assign = Object.assign || function(target, source){
      var props  = keys(source)
        , length = props.length
        , i      = 0
        , key;
      while(length > i)target[key = props[i++]] = source[key];
      return target
    }
  , mixin = Object.mixin || function(target, source){
      return defineProperties(target, getOwnPropertyDescriptors(source))
    }
  /**
   * http://es5.javascript.ru/x9.html#x9.12
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.is
   */ 
  , same = Object.is || function(x,y){
      return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !==y
    };
// Module : arrayInt
function slice1(arrayLike){
  return slice.call(arrayLike, 1)
}
function indexSame(arrayLike, val){
  var i = 0
    , length = toLength(arrayLike.length)
  for(;i < length; i++)if(same(arrayLike[i], val))return i;
  return -1
}
function reduceTo(callbackfn, target){
  target = Object(target);
  forEach.call(arrayLikeSelf(this), callbackfn, target);
  return target
}
// Module : numberInt
function toLength(it){
  var num = toInt(it);
  return num > 0 && izFinite(num) ? num : 0;
}
function sign(it){
  return (it = +it) == 0 || izNaN(it) ? it : it < 0 ? -1 : 1
}
function leadZero(num, length){
  num += '';
  while(num.length < length)num = '0' + num;
  return num;
}
    // http://es5.github.io/#x9.4
var toInt = Number.toInteger || function(it){
      return (it = +it) != it ? 0 : it != 0 && it != Infinity && it != -Infinity ? (it > 0 ? floor : ceil)(it) : it
    }
    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-20.1.2.4
  , izNaN = Number.isNaN || function(it){
      return typeof it == 'number' && it !== it
    }
    // https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.2
  , izFinite = Number.isFinite || function(it){
      return typeof it == 'number' && isFinite(it)
    }
    // https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.3
  , isInt = Number.isInteger || function(it){
      return izFinite(it) && floor(it) == it;
    };
// Module : regexpInt
function getRegExpFlags(reg){
  return String(this).match(/[^\/]*$/)[0]
}
// Module : es6
extendBuiltInObject(Object, {
  /**
   * 19.1.3.1 Object.assign ( target, source )
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-19.1.3.1
   */
  assign: assign,
  /**
   * 19.1.3.10 Object.is ( value1, value2 )
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-19.1.3.10
   * http://wiki.ecmascript.org/doku.php?id=harmony:egal
   */
  is: same,
  /**
   * 19.1.3.15 Object.mixin ( target, source )
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-19.1.3.15
   */
  mixin: mixin//,
  /**
   * 19.1.3.19 Object.setPrototypeOf ( O, proto )
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-19.1.3.19
   * work only if browser support __proto__
  setPrototypeOf: protoInObject()
    ? function(O, proto){
        if(!isObject(O) || !(isObject(proto) || proto === null)){
          throw TypeError("Can't set " + proto + ' as prototype of ' + O)
        }
        O.__proto__ = proto;
        return O
      }
    : function(){
        throw Error("Can't shim Object.setPrototypeOf")
      }
   */
});
var MAX_SAFE_INTEGER = 0x1fffffffffffff;
extendBuiltInObject(Number, {
  /**
   * 20.1.2.1 Number.EPSILON
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.1
   * http://wiki.ecmascript.org/doku.php?id=harmony:number_epsilon
   */
  EPSILON: 2.220446049250313e-16,
  /**
   * 20.1.2.2 Number.isFinite (number)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.2
   * http://wiki.ecmascript.org/doku.php?id=harmony:number.isfinite
   */
  isFinite: izFinite,
  /**
   * 20.1.2.3 Number.isInteger (number)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.3
   * http://wiki.ecmascript.org/doku.php?id=harmony:number.isinteger
   */
  isInteger: isInt,
  /**
   * 20.1.2.4 Number.isNaN (number)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.4
   * http://wiki.ecmascript.org/doku.php?id=harmony:number.isnan
   */
  isNaN: izNaN,
  /**
   * 20.1.2.5 Number.isSafeInteger (number)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.5
   */
  isSafeInteger: function(number){
    return isInt(number) && abs(number) <= MAX_SAFE_INTEGER;
  },
  /**
   * 20.1.2.6 Number.MAX_SAFE_INTEGER
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.6
   */
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
  /**
   * 20.1.2.10 Number.MIN_SAFE_INTEGER
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.10
   */
  MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
  /**
   * 20.1.2.12 Number.parseFloat (string)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.12
   */
  parseFloat: parseFloat,
  /***
   * 20.1.2.13 Number.parseInt (string, radix)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.13
   */
  parseInt: parseInt
});
extendBuiltInObject($Number, {
  /**
   * 20.1.3.1 Number.prototype.clz ()
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.3.1
   */
  clz: function(){
    var number = this >>> 0;
    return number ? 32 - number[toString](2).length : 32
  }
});
extendBuiltInObject(Math, {
  /**
   * 20.2.2.3 Math.acosh(x)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.3
   * Returns an implementation-dependent approximation to the inverse hyperbolic cosine of x.
   */
  acosh: function(x){
    return ln(x + sqrt(x * x - 1))
  },
  /***
   * 20.2.2.5 Math.asinh(x)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.5
   * Returns an implementation-dependent approximation to the inverse hyperbolic sine of x.
   */
  asinh: function(x){
		return !izFinite(x) || x === 0 ? x : ln(x + sqrt(x * x + 1))
  },
  /**
   * 20.2.2.7 Math.atanh(x)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.7
   * Returns an implementation-dependent approximation to the inverse hyperbolic tangent of x.
   */
  atanh: function(x){
    return x === 0 ? x : 0.5 * ln((1 + x) / (1 - x))
  },
  /**
   * 20.2.2.9 Math.cbrt(x)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.9
   * Returns an implementation-dependent approximation to the cube root of x.
   */
  cbrt: function(x){
		return sign(x) * pow(abs(x), 1/3);
  },
  /**
   * 20.2.2.12 Math.cosh(x)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.12
   * Returns an implementation-dependent approximation to the hyperbolic cosine of x.
   */
  cosh: function(x){
    return ((x = +x) == -Infinity) || x === 0 ? x : x(exp(x) + exp(-x)) / 2
  },
  /**
   * 20.2.2.14 Math.expm1 (x)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.14
   * Returns an implementation-dependent approximation to subtracting 1 from the exponential function of x 
   */
  expm1: function(x){
		return same(x, -0) ? -0 : x > -1.0e-6 && x < 1.0e-6 ? x + x * x / 2 : exp(x) - 1
  },
  /**
   * 20.2.2.16 Math.hypot( value1 , value2, value3 = 0 )
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.16
   * Math.hypot returns an implementation-dependent approximation of the square root of the sum of squares of its arguments.
   */
  hypot: function(x, y, /*?*/z){
    if(z === undefined)z = 0;
    return isFinite(x) ? isFinite(y) ? isFinite(z) ? sqrt(x * x + y * y + z * z) : z : y : x
  },
  /**
   * 20.2.2.17 Math.imul(x, y)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.17
   */
  imul: function(x, y){
    var xh = (x >>> 0x10) & 0xffff
      , xl = x & 0xffff
      , yh = (y >>> 0x10) & 0xffff
      , yl = y & 0xffff;
		return xl * yl + (((xh * yl + xl * yh) << 0x10) >>> 0) | 0
  },
  /**
   * 20.2.2.19 Math.log1p (x)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.19
   * Returns an implementation-dependent approximation to the natural logarithm of 1 + x.
   * The result is computed in a way that is accurate even when the value of x is close to zero.
   */
  log1p: function(x){
    return (x > -1.0e-8 && x < 1.0e-8) ? (x - x * x / 2) : ln(1 + x)
  },
  /**
   * 20.2.2.20 Math.log10 (x)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.20
   * Returns an implementation-dependent approximation to the base 10 logarithm of x.
   */
  log10: function(x){
    return ln(x) / Math.LN10
  },
  /**
   * 20.2.2.21 Math.log2 (x)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.21
   * Returns an implementation-dependent approximation to the base 2 logarithm of x.
   */
  log2: function(x){
    return ln(x) / Math.LN2
  },
  /**
   * 20.2.2.28 Math.sign(x)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.28
   * Returns the sign of the x, indicating whether x is positive, negative or zero.
   */
  sign: sign,
  /**
   * 20.2.2.30 Math.sinh(x)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.30
   * Returns an implementation-dependent approximation to the hyperbolic sine of x.
   */
  sinh: function(x){
		return ((x = +x) == -Infinity) || x == 0 ? x : (exp(x) - exp(-x)) / 2
  },
  /**
   * 20.2.2.33 Math.tanh(x)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.33
   * Returns an implementation-dependent approximation to the hyperbolic tangent of x.
   */
  tanh: function(x){
		return izFinite(x = +x) ? x == 0 ? x : (exp(x) - exp(-x)) / (exp(x) + exp(-x)) : sign(x)
  },
  /**
   * 20.2.2.34 Math.trunc(x)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.34
   * Returns the integral part of the number x, removing any fractional digits. If x is already an integer, the result is x.
   */
  trunc: function(x){
    return (x = +x) == 0 ? x : (x > 0 ? floor : ceil)(x)
  }
});
/*
extendBuiltInObject(String, {
  // 21.1.2.2 String.fromCodePoint ( ...codePoints)
  // https://people.mozilla.com/~jorendorff/es6-draft.html#sec-21.1.2.2
  fromCodePoint: function(){ TODO },
  // 21.1.2.4 String.raw ( callSite, ...substitutions)
  // https://people.mozilla.com/~jorendorff/es6-draft.html#sec-21.1.2.4
  raw: function(){ TODO }
});
*/
extendBuiltInObject($String, {
  /**
   * 21.1.3.3 String.prototype.codePointAt (pos)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-21.1.3.3
   */
  codePointAt: function(pos /* = 0 */){
		var value = String(this)
      , size = value.length;
    if((pos |= 0) < 0 || pos >= size)return NaN;
		var first = value.charCodeAt(pos);
		if(first < 0xD800 || first > 0xDBFF || pos + 1 == size)return first;
		var second = value.charCodeAt(pos + 1);
		return(second < 0xDC00 || first > 0xDFFF) ? first : ((first - 0xD800) << 1024) + (second - 0xDC00) + 0x10000
  },
  /**
   * 21.1.3.6 String.prototype.contains (searchString, position = 0 )
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-21.1.3.6
   * http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/contains
   */
  contains: function(searchString, position /* = 0 */){
    return !!~String(this)[indexOf](searchString, position)
  },
  /**
   * 21.1.3.7 String.prototype.endsWith (searchString [, endPosition] )
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-21.1.3.7
   * http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
   */
  endsWith: function(searchString, endPosition /* = @length */){
    var length = this.length;
    searchString += '';
    endPosition = toLength(min(endPosition === undefined ? length : endPosition, length));
    return String(this).slice(endPosition - searchString.length, endPosition) === searchString
  },
  /**
   * 21.1.3.13 String.prototype.repeat (count)
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-21.1.3.13
   * http://wiki.ecmascript.org/doku.php?id=harmony:string.prototype.repeat
   */
  repeat: function(count){
    return fill.call(Array(toInt(count)), this).join('')
  },
  /**
   * 21.1.3.18 String.prototype.startsWith (searchString [, position ] )
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-21.1.3.18
   * http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
   */
  startsWith: function(searchString, position /* = 0 */){
    searchString += '';
    position = toLength(min(position, this.length));
    return String(this).slice(position, position + searchString.length) === searchString
  }
});
extendBuiltInObject(Array, {
  /**
   * 22.1.2.1 Array.from ( arrayLike , mapfn=undefined, thisArg=undefined )
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-22.1.2.1
   * http://wiki.ecmascript.org/doku.php?id=strawman:array_extras
   */
  from: function(arrayLike, mapfn /* -> it */, thisArg /* = undefind */){
    var O = arrayLikeSelf(arrayLike)
      , i = 0
      , length = toLength(O.length)
      , result = new (isFunction(this) ? this : Array)(length);
    if(mapfn)for(; i < length; i++)i in O && (result[i] = mapfn.call(thisArg, O[i], i, O));
    else for(; i < length; i++)i in O && (result[i] = O[i]);
    return result
  },
  /**
   * 22.1.2.3 Array.of ( ...items )
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-22.1.2.3
   * http://wiki.ecmascript.org/doku.php?id=strawman:array_extras
   */
  of: function(/*args...*/){
    var i = 0
      , length = arguments.length
      , result = new (isFunction(this) ? this : Array)(length);
    while(i < length)result[i] = arguments[i++];
    return result
  }
});
function fill(value, start /* = 0 */, end /* = @length */){
  var length = toLength(this.length);
  if((start |= 0) < 0 && (start = length + start) < 0)return this;
  end = end == undefined ? length : end | 0;
  while(end > start)this[start++] = value;
  return this
}
extendBuiltInObject($Array, {
  /**
   * 22.1.3.3 Array.prototype.copyWithin (target, start, end = this.length)
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.prototype.copywithin
  copyWithin: function(target, start, end){

  },
   */
  /**
   * 22.1.3.6 Array.prototype.fill (value, start = 0, end = this.length)
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-22.1.3.6
   * http://wiki.ecmascript.org/doku.php?id=strawman:array_fill_and_move
   */
  fill: fill,
  /**
   * 22.1.3.8 Array.prototype.find ( predicate , thisArg = undefined )
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-22.1.3.8
   */
  find: function(predicate, thisArg /* = undefind */){
    var O = Object(this)
      , self = arrayLikeSelf(O)
      , length = toLength(self.length)
      , val, i = 0;
    for(; i < length; i++)if(i in self && predicate.call(thisArg, val = self[i], i, O))return val
  },
  /**
   * 22.1.3.9 Array.prototype.findIndex ( predicate , thisArg = undefined )
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-22.1.3.9
   */
  findIndex: function(predicate, thisArg /* = undefind */){
    var O = Object(this)
      , self = arrayLikeSelf(O)
      , length = toLength(self.length)
      , i = 0;
    for(; i < length; i++)if(i in self && predicate.call(thisArg, self[i], i, O))return i;
    return -1
  }
});
// Module : es6c
!function(){
  var Map = global.Map
    , Set = global.Set
    , sizeDesc = {
        'get': function(){
          return this._values.length;
        }
      };
  function setSize(foo){
    foo.size = foo._values.length;
  }
  /**
   * 23.1 Map Objects
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map-objects
   */
  if(!isNative(Map) || !has(Map[prototype], 'forEach')){
    global.Map = Map = function(iterable){
      var that = this;
      if(!(that instanceof Map))return new Map(iterable);
      that.clear();
      isArray(iterable) && iterable.forEach(function(val){
        that.set(val[0], val[1]);
      });
    }
    extendBuiltInObject(Map[prototype], {
      /**
       * 23.1.3.1 Map.prototype.clear ()
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.1.3.1
       */
      clear: function(){
        defineProperties(this, {_keys: descriptor(4, []), _values: descriptor(4, [])});
        $DESC || setSize(this);
      },
      /**
       * 23.1.3.3 Map.prototype.delete ( key )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.1.3.3
       */
      'delete': function(key){
        var keys = this._keys
          , values = this._values
          , index = indexSame(keys, key);
        if(~index){
          keys.splice(index, 1);
          values.splice(index, 1);
          $DESC || setSize(this);
          return true
        }
        return false
      },
      /**
       * 23.1.3.5 Map.prototype.forEach ( callbackfn , thisArg = undefined )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.1.3.5
       */
      forEach: function(callbackfn, thisArg /* = undefined */){
        var keys = this._keys
          , values = this._values
          , length = values.length
          , i = 0;
        while(length > i)callbackfn.call(thisArg, values[i], keys[i++], this)
      },
      /**
       * 23.1.3.6 Map.prototype.get ( key )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.1.3.6
       */
      get: function(key){
        return this._values[indexSame(this._keys, key)]
      },
      /**
       * 23.1.3.7 Map.prototype.has ( key )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.1.3.7
       */
      has: function(key){
        return !!~indexSame(this._keys, key)
      },
      /**
       * 23.1.3.9 Map.prototype.set ( key , value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.1.3.9
       */
      set: function(key, value){
        var keys = this._keys,
            values = this._values,
            index = indexSame(keys, key);
        if(!~index){
          keys.push(key);
          values.push(value);
          $DESC || setSize(this);
        }
        else values[index] = value;
        return this
      }
    });
    $DESC && defineProperty(Map[prototype], 'size', sizeDesc);
  }
  // IE 11 fix
  else if(!function(){try{return Map([[1,2]]).size==1}catch(e){}}()){
    global.Map = function(iterable){
      var that = new Map;
      isArray(iterable) && iterable.forEach(function(val){
        that.set(val[0], val[1]);
      });
      return that;
    }
    global.Map[prototype] = Map[prototype];
  }
  /**
   * 23.2 Set Objects
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-set-objects
   */
  if(!isNative(Set) || !has(Set[prototype], 'forEach')){
    global.Set = Set = function(iterable){
      if(!(this instanceof Set))return new Set(iterable);
      this.clear();
      isArray(iterable) && iterable.forEach(this.add, this);
    };
    extendBuiltInObject(Set[prototype], {
      /**
       * 23.2.3.1 Set.prototype.add (value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.2.3.1
       */
      add: function(value){
        var values = this._values;
        if(!~indexSame(values, value)){
          values.push(value);
          $DESC || setSize(this);
        }
        return this
      },
      /**
       * 23.2.3.2 Set.prototype.clear ()
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.2.3.2
       */
      clear: function(){
        defineProperty(this, '_values', descriptor(4, []));
        $DESC || setSize(this);
      },
      /**
       * 23.2.3.4 Set.prototype.delete ( value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.2.3.4
       */
      'delete': function(value){
        var values = this._values
          , index = indexSame(values, value);
        if(~index){
          values.splice(index, 1);
          $DESC || setSize(this);
          return true
        }
        return false
      },
      /**
       * 23.2.3.6 Set.prototype.forEach ( callbackfn , thisArg = undefined )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.2.3.6
       */
      forEach: function(callbackfn, thisArg /* = undefined */){
        var values = this._values
          , length = values.length
          , i = 0
          , val;
        while(length > i)callbackfn.call(thisArg, val = values[i++], val, this)
      },
      /**
       * 23.2.3.7 Set.prototype.has ( value )
       * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-23.2.3.7
       */
      has: function(value){
        return !!~indexSame(this._values, value)
      }
    });
    $DESC && defineProperty(Set[prototype], 'size', sizeDesc);
  }
  // IE 11 fix
  else if(!function(){try{return Set([1]).size==1}catch(e){}}()){
    global.Set = function(iterable){
      var that = new Set;
      isArray(iterable) && iterable.forEach(that.add, that);
      return that;
    }
    global.Set[prototype] = Set[prototype];
  }
}();
// Module : timers
!function(navigator, setTimeout, setInterval, postMessage, setImmediate, clearImmediate, addEventListener){
  function timersBind(fn, args){
    return part.apply(isFunction(fn) ? fn : Function(fn), args);
  }
  /**
   * ie9- setTimeout & setInterval additional parameters fix
   * on ie8- work only as (global|window).setTimeout, instead of setTimeout
   * http://www.w3.org/TR/html5/webappapis.html#timers
   * http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#timers
   */
  if(navigator && /MSIE .\./.test(navigator.userAgent)){
    global.setTimeout = function(fn, time /*, args...*/){
      return setTimeout(timersBind(fn, slice.call(arguments, 2)), time || 1)
    };
    global.setInterval = function(fn, time /*, args...*/){
      return setInterval(timersBind(fn, slice.call(arguments, 2)), time || 1)
    }
  }
  /**
   * setImmediate
   * https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
   */
  if(!isFunction(global[setImmediate]) || !isFunction(global[clearImmediate])){
    if(isFunction(postMessage)){
      var msg     = setImmediate + random()
        , counter = 0
        , queue   = {}
        , listner = function(e){
            var id = e.data;
            if(id in queue){
              queue[id]();
              delete queue[id]
            }
          }
      global[setImmediate] = function(fn /*, args...*/){
        var id = ++counter + msg;
        queue[id] = timersBind(fn, slice1(arguments));
        postMessage(id, global.location);
        return counter
      }
      global[clearImmediate] = function(id){
        delete queue[id + msg]
      }
      if(addEventListener)addEventListener('message', listner, false);
      else attachEvent('onmessage', listner)
    }
    else {
      global[setImmediate] = function(fn /*, args...*/){
        return setTimeout(timersBind(fn, slice1(arguments)), 0)
      }
      global[clearImmediate] = Function('i','clearTimeout(i)')
    }
  }
}(global.navigator, setTimeout, setInterval, global.postMessage, 'setImmediate', 'clearImmediate', global.addEventListener);
// Module : function
function invoke(args){
  var instance = create(this.prototype)
    , result   = this.apply(instance, arrayLikeSelf(args || []));
  return isObject(result) ? result : instance
}
function inherits(parent){
  this[prototype] = create(parent[prototype], getOwnPropertyDescriptors(this[prototype]));
  return this
}
extendBuiltInObject(Function, {
  isNative: isNative,
  inherits: unbind.call(inherits)
});
extendBuiltInObject($Function, {
  // method -> function
  unbind: unbind,
  // function -> method
  methodize: methodize,
  // partial apply
  part: part,
  partial: function(args/*?*/, that){
    var fn       = this
      , argsPart = toArray(args)
      , isThat   = arguments.length > 1;
    return function(/*args...*/){
      var args   = toArray(argsPart)
        , length = arguments.length
        , i, current = i = 0;
      while(length > i){
        while(args[current] !== undefined)current++;
        args[current++] = arguments[i++]
      }
      return fn.apply(isThat ? that : this, args)
    }
  },
  // http://www.wirfs-brock.com/allen/posts/166
  // http://habrahabr.ru/post/114737/
  only: function(numberArguments/*?*/, that){
    numberArguments |= 0;
    var fn     = this
      , isThat = arguments.length > 1;
    return function(/*args...*/){
      return fn.apply(isThat ? that : this, slice.call(arguments, 0, min(numberArguments, arguments.length)))
    }
  },
  // simple bind context
  ctx: ctx,
  invoke: invoke,
  getInstance: function(){
    var getInstance = 'getInstance', instance;
    if(!has(this, getInstance)){ // <= protect from Function.prototype.getInstance()
      this[getInstance] = function(){
        return instance
      };
      return instance = this.invoke(arguments)
    }
  },
  once: function(){
    var fn   = this
      , wait = 1
      , result;
    return function(/*args...*/){
      if(wait){
        wait   = 0;
        result = fn.apply(this, arguments)
      }
      return result
    }
  },
  // AOP
  error: function(cb /*cb(error, arguments)*/){
    var fn = this;
    return function(/*args...*/){
      var args = toArray(arguments);
      try{return fn.apply(this, args)}
      catch(e){return cb.call(this, e, args)}
    }
  },
  before: function(cb /*cb(arguments)*/){
    var fn = this;
    return function(/*args...*/){
      var args = toArray(arguments);
      cb.call(this, args);
      return fn.apply(this, args)
    }
  },
  after: function(cb /*cb(result, arguments)*/){
    var fn = this;
    return function(/*args...*/){
      var args        = toArray(arguments)
        , result      = fn.apply(this, args)
        , resultAfter = cb.call(this, result, args);
      return resultAfter === undefined ? result : resultAfter
    }
  },
  // deferred call
  timeout: function(del /*, args...*/){
    return part.call(
      clearTimeout,
      setTimeout(part.apply(this, slice1(arguments)), del)
    )
  },
  interval: function(del /*, args...*/){
    return part.call(
      clearInterval,
      setInterval(part.apply(this, slice1(arguments)), del)
    )
  },
  immediate: function(/* args...*/){
    return part.call(
      clearImmediate,
      setImmediate(part.apply(this, arguments))
    )
  },
  inherits: inherits
});
// Module : object
!function(){
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
          deep && merge(target[key], source[key], 1, reverse, desc, stackA, stackB)    // if not deep - skip
        }
        else if(desc){
          targetDescriptor = getOwnPropertyDescriptor(target, key) || $Object;
          if(targetDescriptor.configurable !== false && delete target[key]){
            sourceDescriptor = getOwnPropertyDescriptor(source, key);
            if(deep && !sourceDescriptor.get && !sourceDescriptor.set){
              sourceDescriptor.value =
                merge(clone(sourceDescriptor.value, 1, 1, stackA, stackB),
                  targetDescriptor.value, 1, 1, 1, stackA, stackB);
            }
            defineProperty(target, key, sourceDescriptor)
          }
        }
        else target[key] = deep
          ? merge(clone(source[key], 1, 0, stackA, stackB), target[key], 1, 1, 0, stackA, stackB)
          : source[key]
      }
    }
    return target
  }
  /**
   * http://wiki.ecmascript.org/doku.php?id=strawman:structured_clone
   * https://github.com/dslomov-chromium/ecmascript-structured-clone
   */
  function clone(object, deep /* = false */, desc /* = false */, stackA, stackB){
    if(!isObject(object))return object;
    stackA || (stackA = []);
    stackB || (stackB = []);
    var already = stackA[indexOf](object)
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
        result = RegExp(object.source, getRegExpFlags.call(object));
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
        result = create(getPrototypeOf(object))
    }
    stackA.push(object);
    stackB.push(result);
    return merge(result, object, deep, 0, desc, stackA, stackB)
  }
  function make(proto, props, simple /* = false */){
    return props ? (simple ? assign : mixin)(create(proto), props) : create(proto)
  }
  // Objects deep compare
  function deepEqual(a, b, StackA, StackB){
    if(same(a, b))return true;
    var type = classof(a)
      , length, keys, val;
    if(
      !isObject(a) || !isObject(b)
      || type != classof(b)
      || getPrototypeOf(a) != getPrototypeOf(b)
    )return false;
    StackA = isArray(StackA) ? StackA.concat([a]) : [a];
    StackB = isArray(StackB) ? StackB.concat([b]) : [b];
    switch(type){
      case'Boolean'   :
      case'String'    :
      case'Number'    : return a.valueOf() == b.valueOf();
      case'RegExp'    : return String(a) == String(b);
      case'Error'     : return a.message == b.message;/*
      case'Array'     :
      case'Arguments' :
        length = toLength(a.length);
        if(length != b.length)return false;
        while(length--){
          if(
            !(~StackA[indexOf](a[length]) && ~StackB[indexOf](b[length]))
            && !deepEqual(a[length], b[length], StackA, StackB)
          )return false;
        }
        return true*/
    }
    keys = getOwnPropertyNames(a);
    length = keys.length;
    if(length != getOwnPropertyNames(b).length)return false;
    while(length--){
      if(
        !(~StackA[indexOf](a[val = keys[length]]) && ~StackB[indexOf](b[val]))
        && !deepEqual(a[val], b[val], StackA, StackB)
      )return false
    }
    return true
  }
  function objectReduceTo(object, fn, target){
    target = Object(target);
    forOwnKeys(object, fn, target);
    return target;
  }
  function forOwnKeys(object, fn, that /* = undefined */){
    var O      = arrayLikeSelf(object)
      , props  = keys(O)
      , length = props.length
      , i      = 0
      , key;
    while(length > i)fn.call(that, O[key = props[i++]], key, object);
    return object
  }
  function findIndex(object, fn, that /* = undefined */){
    var O      = arrayLikeSelf(object)
      , props  = keys(O)
      , length = props.length
      , i      = 0
      , key;
    while(length > i){
      if(fn.call(that, O[key = props[i++]], key, object))return key
    }
  }
  extendBuiltInObject(Object, {
    has: has,
    isEnumerable: isEnumerable,
    isPrototype: isPrototype,
    classof: classof,
    // Extended object api from harmony and strawman :
    // http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
    getPropertyDescriptor: getPropertyDescriptor,
    // http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
    getOwnPropertyDescriptors: getOwnPropertyDescriptors,
    // http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
    getPropertyDescriptors: function(object){
      var result = getOwnPropertyDescriptors(object)
        , i, length, names, key;
      while(object = getPrototypeOf(object)){
        names  = getOwnPropertyNames(object);
        i      = 0;
        length = names.length;
        while(length > i){
          if(!has(result, key = names[i++])){
            result[key] = getOwnPropertyDescriptor(object, key);
          }
        }
      }
      return result
    },
    // http://wiki.ecmascript.org/doku.php?id=strawman:extended_object_api
    getPropertyNames: function(object){
      var result = getOwnPropertyNames(object)
        , i, length, names, key;
      while(object = getPrototypeOf(object)){
        i      = 0;
        names  = getOwnPropertyNames(object);
        length = names.length;
        while(length > i)~result[indexOf](key = names[i++]) || result.push(key)
      }
      return result
    },
    // Shugar for Object.create
    make: make,
    // Shugar for Object.make(null[, params, simple])
    plane: function(props, simple /* = false */){
      return make(null, props, simple)
    },
    clone: clone,
    merge: merge,
    // Shugar for Object.merge(targ, src, 1, 1)
    defaults: function(target, props){
      return merge(target, props, 1, 1)
    },
    // {a:b} -> [b]
    values: function(object){
      var props  = keys(object)
        , length = props.length
        , result = Array(length)
        , i      = 0;
      while(length > i)result[i] = object[props[i++]];
      return result
    },
    // {a: b} -> {b: a}
    invert: invert,
    // Enumerable
    every: function(object, fn, that /* = undefined */){
      var O      = arrayLikeSelf(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i){
        if(!fn.call(that, O[key = props[i++]], key, object))return false;
      }
      return true
    },
    filter: function(object, fn, that /* = undefined */){
      var O      = arrayLikeSelf(object)
        , result = {}
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i){
        if(fn.call(that, O[key = props[i++]], key, object))result[key] = O[key];
      }
      return result
    },
    find: function(object, fn, that /* = undefined */){
      var index = findIndex(object, fn, that);
      return index === undefined ? undefined : object[index];
    },
    findIndex: findIndex,
    forEach: forOwnKeys,
    indexOf: function(object, searchElement){
      var O      = arrayLikeSelf(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i)if(same(O[key = props[i++]],searchElement))return key
    },
    map: function(object, fn, that /* = undefined */){
      var O      = arrayLikeSelf(object)
        , result = {}
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i){
        result[key = props[i++]] = fn.call(that, O[key], key, object);
      }
      return result
    },
    reduce: function(object, fn, result /* = undefined */, that /* = undefined */){
      var O      = arrayLikeSelf(object)
        , props  = keys(O)
        , i      = 0
        , length = props.length
        , key;
      if(arguments.length < 3){
        if(!length--)throw TypeError(REDUCE_ERROR);
        result = O[props.shift()];
      }
      while(length > i){
        result = fn.call(that, result, O[key = props[i++]], key, object);
      }
      return result
    },
    some: function(object, fn, that /* = undefined */){
      var O      = arrayLikeSelf(object)
        , props  = keys(O)
        , length = props.length
        , i      = 0
        , key;
      while(length > i){
        if(fn.call(that, O[key = props[i++]], key, object))return true;
      }
      return false
    },
    props: function(object, prop){
      object = arrayLikeSelf(object);
      var names  = keys(object)
        , result = {}
        , length = names.length
        , i      = 0
        , key, val;
      while(length > i){
        key = names[i++];
        val = object[key];
        result[key] = val == undefined ? undefined : val[prop]
      }
      return result
    },
    reduceTo: objectReduceTo,
    deepEqual: deepEqual,
    isObject   : isObject,
    isUndefined: function(it){
      return it === undefined
    },
    isNull     : function(it){
      return it === null
    },
    isNumber   : function(it){
      return $toString(it) == '[object Number]'
    },
    isString   : isString,
    isBoolean  : function(it){
      return it === !!it || $toString(it) == '[object Boolean]'
    },
    isArray    : isArray,
    isFunction : isFunction,
    isRegExp   : function(it){
      return $toString(it) == '[object RegExp]'
    },
    isDate     : isDate,
    isError    : function(it){
      return $toString(it) == '[object Error]'
    },
    isArguments: isArguments
  });
}();
// Module : wrap
function Wrap(object){
  if(!(this instanceof Wrap))return new Wrap(object);
  this.value = object
}
var $Wrap = Wrap[prototype];
extendBuiltInObject(Object, {Wrap: Wrap});
splitComma(
  // ES5:
  'defineProperty,defineProperties,getPrototypeOf,create,' +
  // ES6:
  'assign,mixin,' +
  // Core.js:
  'getOwnPropertyDescriptors,getPropertyDescriptors,make,plane,' +
  'clone,merge,defaults,invert,filter,forEach,map,props,reduceTo'
).forEach(function(key){
  var fn = Object[key];
    isFunction(fn) && defineProperty($Wrap, key, descriptor(6, function(){
      var value = this.value
        , args  = [value]
        , result;
      push.apply(args, arguments);
      result = fn.apply(this, args)
      return value === result ? this : new Wrap(result)
    }));
});
getOwnPropertyNames(Object).forEach(function(key){
  var fn = Object[key];
  isFunction(fn) && !has($Wrap, key)
    && defineProperty($Wrap, key, descriptor(6, function(){
      var args = [this.value];
      push.apply(args, arguments);
      return fn.apply(this, args)
    }));
});
extendBuiltInObject($Wrap, {
  get: function(key){
    var object = this.value;
    return has(object, key) ? object[key] : undefined
  },
  set: function(key, value){
    this.value[key] = value;
    return this
  },
  'delete': function(key){
    delete this.value[key];
    return this
  }
});
// Module : array
!function(){
  function arraySum(/*?*/mapArg){
    var result = 0
      , that   = createMap(this, mapArg)
      , i      = 0
      , length = toLength(that.length);
    for(; length > i; i++)if(i in that)result += +that[i];
    return result
  }
  function props(key){
    var that   = arrayLikeSelf(this)
      , length = toLength(that.length)
      , result = Array(length)
      , i      = 0
      , val;
    for(; length > i; i++)if(i in that){
      val = that[i];
      result[i] = val == undefined ? undefined : val[key]
    }
    return result
  }
  function createMap(that, it){
    switch(classof(it)){
      case 'Function':
        return map.call(that, it);
      case 'String':
      case 'Number':
        return props.call(that, it)
    }
    return arrayLikeSelf(that)
  }
  extendBuiltInObject($Array, {
    at: function(index){
      return arrayLikeSelf(this)[0 > index ? this.length + index : index]
    },
    props   : props,
    reduceTo: reduceTo,
    indexSame: function(val){
      return indexSame(arrayLikeSelf(this), val)
    },
    merge: function(arrayLike){
      push.apply(this, arrayLikeSelf(arrayLike));
      return this;
    },
    sum: arraySum,
    avg: function(/*?*/mapArg){
      return this.length ? arraySum.call(this, mapArg) / this.length : 0
    },
    min: function(/*?*/mapArg){
      return min.apply(undefined, createMap(this, mapArg));
    },
    max: function(/*?*/mapArg){
      return max.apply(undefined, createMap(this, mapArg));
    },
    unique: function(/*?*/mapArg){
      var result = []
        , that   = createMap(this, mapArg)
        , length = toLength(that.length)
        , i      = 0
        , value;
      while(length > i)~indexSame(result, value = that[i++]) || result.push(value);
      return result
    },
    cross: function(arrayLike){
      var result = []
        , that   = arrayLikeSelf(this)
        , length = toLength(that.length)
        , array  = arrayLikeSelf(arrayLike)
        , i = 0
        , value;
      while(length > i)!~indexSame(result, value = that[i++]) && ~indexSame(array, value) && result.push(value);
      return result
    }
  });
}();
// Module : arrayStatics
/**
 * Array static methods
 * http://wiki.ecmascript.org/doku.php?id=strawman:array_statics
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Array_generic_methods
 */
extendBuiltInObject(Array, reduceTo.call(
   splitComma(
    // ES3:
    'concat,join,pop,push,reverse,shift,slice,sort,splice,unshift,' +
    // ES5:
    indexOf + ',lastIndexOf,every,some,forEach,map,filter,reduce,reduceRight,' +
    // ES6:
    'find,findIndex,' +
    // Core.js:
    'at,props,reduceTo,indexSame,merge,sum,avg,min,max,unique,cross'
  ),
  function(key){
    if(key in $Array)this[key] = unbind.call($Array[key])
  }
));
// Module : number
extendBuiltInObject(Number, {
  toInteger: toInt
});
extendBuiltInObject($Number, {
  div: function(divisor){
    var result = this / divisor;
    return (result > 0 ? floor : ceil)(result)
  },
  times: function(fn, that /* = undefined */){
    var i = 0, num = this | 0, result = Array(num);
    if(isFunction(fn))while(num > i)result[i] = fn.call(that, i, i++, this);
    return result
  },
  random: function(number /* = 0 */){
    var a = this || 0
      , b = number || 0
      , m = min(a, b);
    return random() * (max(a, b) - m) + m
  },
  rand: function(number /* = 0 */){
    var a = toInt(this)
      , b = toInt(number)
      , m = min(a, b);
    return floor((random() * (max(a, b) + 1 - m)) + m)
  },
  odd: function(){
    return !!(this % 2) && !(this % 1)
  },
  even: function(){
    return 0 === this % 2
  },
  format: function(afterDot /* = 0 */, thousandsSeparator /* = '' */, decimalMark /* = '.' */){
    var afterDot    = toLength(afterDot)
      , integer     = String(toInt(this))
      , fractional  = leadZero(toInt(abs(Math.round((this - integer) * pow(10, afterDot)))), afterDot);
    if(thousandsSeparator){
      integer    = integer   .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + thousandsSeparator);
      fractional = fractional.replace(/(\d{3})(?=\d)/g,          '$1' + thousandsSeparator);
    }
    return afterDot ? integer + (decimalMark == undefined ? '.' : decimalMark) + fractional : integer;
  }
});
extendBuiltInObject($Number, reduceTo.call(
  //IE...
  //getOwnPropertyNames(Math),
  splitComma(
    // ES3
    'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,pow,sqrt,max,min,pow,atan2,' +
    // ES6
    'acosh,asinh,atanh,cbrt,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc'
  ),
  function(key){
    if(key in Math)this[key] = methodize.call(Math[key]);
  }
));
// Module : string
!function(){
  var LTrimRegExp = RegExp(LTrim)
    , RTrimRegExp = RegExp(RTrim)
    , dictionaryEscapeHTML = {
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
    // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/trimLeft
    trimLeft: function(){
      return String(this).replace(LTrimRegExp, '')
    },
    // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/trimRight
    trimRight: function(){
      return String(this).replace(RTrimRegExp, '')
    },
    escapeHTML: function(){
      return String(this).replace(RegExpEscapeHTML, function(part){
        return dictionaryEscapeHTML[part];
      })
    },
    unescapeHTML: function(){
      return String(this).replace(RegExpUnescapeHTML, function(part, key){
        return dictionaryUnescapeHTML[key];
      })
    },
    escapeURL: function(component /* = false */){
      return (component ? encodeURIComponent : encodeURI)(this)
    },
    unescapeURL: function(component /* = false */){
      return (component ? decodeURIComponent : decodeURI)(this)
    },
    escapeRegExp: function(){
      return String(this).replace(RegExpEscapeRegExp, '\\$1')
    },
    reverse: function(){
      return String(this).split('').reverse().join('')
    },
    at: function(index){
      var that = String(this);
      return that.charAt(index < 0 ? that.length + index : index)
    }
  });
}();
// Module : regexp
extendBuiltInObject(RegExp[prototype], {
  fn: function(){
    var that = this;
    return function(it){
      return that.test(it)
    }
  },
  getFlag: getRegExpFlags
});
// Module : date
!function(){
  function format(template, lang /* = current */){
    var that = isDate(this) ? this : new Date
      , locale = locales[has(locales, lang) ? lang : current];
    return String(template).replace(formatRegExp, function(part, key){
      switch(key){
        case 'ms'   : return that.getMilliseconds();                  // mSec    : 1-999
        case 's'    : return that[getSeconds]();                      // Seconds : 1-59
        case 'ss'   : return leadZero(that[getSeconds](), 2);         // Seconds : 01-59
        case 'm'    : return that[getMinutes]();                      // Minutes : 1-59
        case 'mm'   : return leadZero(that[getMinutes](), 2);         // Minutes : 01-59
        case 'h'    : return that[getHours]() % 12 || 12              // Hours   : 1-23
        case 'hh'   : return leadZero(that[getHours]() % 12 || 12, 2);// Hours   : 01-23
        case 'H'    : return that[getHours]();                        // Hours   : 1-11
        case 'HH'   : return leadZero(that[getHours](), 2);           // Hours   : 01-11
        case 'd'    : return that.getDate();                          // Date    : 1-31
        case 'dd'   : return leadZero(that.getDate(), 2);             // Date    : 01-31
        case 'w'    : return locale.w[that.getDay()];                 // Day     : Понедельник
        case 'n'    : return that[getMonth]() + 1;                    // Month   : 1-12
        case 'nn'   : return leadZero(that[getMonth]() + 1, 2);       // Month   : 01-12
        case 'M'    : return locale.M[that[getMonth]()];              // Month   : Январь
        case 'MM'   : return locale.MM[that[getMonth]()];             // Month   : Января
        case 'yy'   : return leadZero(that[getFullYear]() % 100, 2);  // Year    : 13
        case 'yyyy' : return that[getFullYear]()                      // Year    : 2013
      }
      return part
    })
  }
  function addLocale(lang, locale){
    locales[lang] = {
      w : splitComma(locale.w),
      M : splitComma(locale.M).map(flexio(0)),
      MM: splitComma(locale.M).map(flexio(1))
    }
  }
  function flexio(index){
    return function(it){
      return it.replace(/\+(.+)$/, function(part, str){
        return str.split('|')[index]
      })
    }
  }
  var formatRegExp = /\b(\w\w*)\b/g
    , current = 'en'
    , locales = {}
    , getSeconds = 'getSeconds'
    , getMinutes = 'getMinutes'
    , getHours = 'getHours'
    , getMonth = 'getMonth'
    , getFullYear = 'getFullYear';
  extendBuiltInObject(Date, {
    locale: function(locale){
      if(has(locales, locale))current = locale;
      return current
    },
    addLocale: addLocale,
    format: format
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
// Module : async
var parallel;
extendBuiltInObject(Function, {
  series: function(queue, then /* ? */){
    var isThen    = isFunction(then)
      , sliceArgs = isThen ? 2 : 1
      , current   = 0
      , args, inArgs;
    function next(i, error){
      if(i == current){ // <= protect from reexecution
        inArgs = current++ in queue;
        if(isThen && (error || !inArgs))then.apply(undefined, slice1(arguments));
        else if(inArgs){
          args = slice.call(arguments, sliceArgs);
          args.push(part.call(next, current));
          queue[current].apply(undefined, args)
        }
      }
    }
    queue.length ? queue[0](part.call(next, 0)) : isThen && then()
  },
  parallel: parallel = function(fns, then){
    var run     = toLength(fns.length)
      , results = Array(run);
    if(run)forEach.call(fns, function(fn, key){
      fn(function(error, result){
        if(run && !(key in results)){ // <= protect from reexecution
          if(error)run = 1;
          results[key] = result;
          --run || then(error, results);
        }
      });
    });
    else then(undefined, results);
  }
});
extendBuiltInObject($Array, {
  asyncMap: function(fn, then){
    parallel(map.call(this, function(val){
      return part.call(fn, val)
    }), then);
  }
});
// Module : console
var _console = global.console || {}
  // https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
  , $console = reduceTo.call(
      splitComma('assert,count,clear,debug,dir,dirxml,error,exception,' +
        'group,groupCollapsed,groupEnd,info,log,table,trace,warn,markTimeline,profile,' +
        'profileEnd,time,timeEnd,timeStamp'),
      function(key){
          this[key] = function(){
            return _console[key] && $console.enable && apply.call(_console[key], _console, arguments)
          };
        },
      {enable: true});
try {
  delete global.console
} catch(e){}
$console = global.console = extendBuiltInObject($console.log, $console);
}(typeof window != 'undefined' ? window : global, Function, Object, Array, String, Number, RegExp, Date, TypeError, Math, isFinite);