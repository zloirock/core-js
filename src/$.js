'use strict';
var global         = require('./$.global')
  , defineProperty = Object.defineProperty
  , hasOwnProperty = {}.hasOwnProperty
  , ceil  = Math.ceil
  , floor = Math.floor
  , max   = Math.max
  , min   = Math.min
  , trunc = Math.trunc || function(it){
      return (it > 0 ? floor : ceil)(it);
    }
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it) ? 0 : trunc(it);
}
function desc(bitmap, value){
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
  return DESC ? function(object, key, value){
    return $.setDesc(object, key, desc(bitmap, value));
  } : simpleSet;
}
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){try {
  return defineProperty({}, 'a', {get: function(){ return 2 }}).a == 2;
} catch(e){}}();
var hide = createDefiner(1)
  , core = {};

function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}

function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
};
assert.def = function(it){
  if(it == undefined)throw TypeError('Function called on null or undefined');
  return it;
};
assert.fn = function(it){
  if(!isFunction(it))throw TypeError(it + ' is not a function!');
  return it;
};
assert.obj = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
assert.inst = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
assert.REDUCE = 'Reduce of empty object with no initial value';

var $ = {
  g: global,
  FW: true,
  path: global,
  core: core,
  html: global.document && document.documentElement,
  // http://jsperf.com/core-js-isobject
  isObject: isObject,
  isFunction: isFunction,
  // Optional / simple context binding
  ctx: function(fn, that, length){
    assert.fn(fn);
    if(~length && that === undefined)return fn;
    switch(length){
      case 1: return function(a){
        return fn.call(that, a);
      }
      case 2: return function(a, b){
        return fn.call(that, a, b);
      }
      case 3: return function(a, b, c){
        return fn.call(that, a, b, c);
      }
    } return function(/* ...args */){
        return fn.apply(that, arguments);
    }
  },
  it: function(it){
    return it;
  },
  that: function(){
    return this;
  },
  // 7.1.4 ToInteger
  toInteger: toInteger,
  // 7.1.15 ToLength
  toLength: function(it){
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  },
  toIndex: function(index, length){
    var index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  },
  trunc: trunc,
  // 20.1.2.4 Number.isNaN(number)
  isNaN: function(number){
    return number != number;
  },
  has: function(it, key){
    return hasOwnProperty.call(it, key);
  },
  create:     Object.create,
  getProto:   Object.getPrototypeOf,
  DESC:       DESC,
  desc:       desc,
  getDesc:    Object.getOwnPropertyDescriptor,
  setDesc:    defineProperty,
  getKeys:    Object.keys,
  getNames:   Object.getOwnPropertyNames,
  getSymbols: Object.getOwnPropertySymbols,
  ownKeys: function(it){
    assert.obj(it);
    return $.getSymbols ? $.getNames(it).concat($.getSymbols(it)) : $.getNames(it);
  },
  // Dummy, fix for not array-like ES3 string in es5 module
  ES5Object: Object,
  toObject: function(it){
    return $.ES5Object(assert.def(it));
  },
  hide: hide,
  def: createDefiner(0),
  set: global.Symbol ? simpleSet : hide,
  mix: function(target, src){
    for(var key in src)hide(target, key, src[key]);
    return target;
  },
  // $.a('str1,str2,str3') => ['str1', 'str2', 'str3']
  a: function(it){
    return String(it).split(',');
  },
  each: [].forEach,
  assert: assert
};
module.exports = $;