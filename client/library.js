/**
 * Core.js 0.7.2
 * https://github.com/zloirock/core-js
 * License: http://rock.mit-license.org
 * © 2015 Denis Pushkarev
 */
!function(undefined){
var __e = null, __g = null;

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./es5');
require('./es6.symbol');
require('./es6.object.assign');
require('./es6.object.is');
require('./es6.object.set-prototype-of');
require('./es6.object.statics-accept-primitives');
require('./es6.number.statics');
require('./es6.math');
require('./es6.string.from-code-point');
require('./es6.string.raw');
require('./es6.string.iterator');
require('./es6.string.prototype');
require('./es6.array.from');
require('./es6.array.of');
require('./es6.array.iterator');
require('./es6.array.species');
require('./es6.array.prototype');
require('./es6.promise');
require('./es6.collections');
require('./es6.reflect');
require('./es7.array.includes');
require('./es7.string.at');
require('./es7.regexp.escape');
require('./es7.object.get-own-property-descriptors');
require('./es7.object.to-array');
require('./es7.abstract-refs');
require('./web.immediate');
require('./web.dom.iterable');
require('./web.timers');
require('./core.dict');
require('./core.iter-helpers');
require('./core.$for');
require('./core.delay');
require('./core.binding');
require('./core.object');
require('./core.array.turn');
require('./core.number.iterator');
require('./core.number.math');
require('./core.string.escape-html');
require('./core.date');
require('./core.global');
require('./core.log');
require('./js.array.statics');
},{"./core.$for":23,"./core.array.turn":24,"./core.binding":25,"./core.date":26,"./core.delay":27,"./core.dict":28,"./core.global":29,"./core.iter-helpers":30,"./core.log":31,"./core.number.iterator":32,"./core.number.math":33,"./core.object":34,"./core.string.escape-html":35,"./es5":36,"./es6.array.from":37,"./es6.array.iterator":38,"./es6.array.of":39,"./es6.array.prototype":40,"./es6.array.species":41,"./es6.collections":42,"./es6.math":43,"./es6.number.statics":44,"./es6.object.assign":45,"./es6.object.is":46,"./es6.object.set-prototype-of":47,"./es6.object.statics-accept-primitives":48,"./es6.promise":49,"./es6.reflect":50,"./es6.string.from-code-point":51,"./es6.string.iterator":52,"./es6.string.prototype":53,"./es6.string.raw":54,"./es6.symbol":55,"./es7.abstract-refs":56,"./es7.array.includes":57,"./es7.object.get-own-property-descriptors":58,"./es7.object.to-array":59,"./es7.regexp.escape":60,"./es7.string.at":61,"./js.array.statics":62,"./web.dom.iterable":63,"./web.immediate":64,"./web.timers":65}],2:[function(require,module,exports){
'use strict';
// false -> Array#indexOf
// true  -> Array#includes
var $ = require('./$');
module.exports = function(IS_CONTAINS){
  return function(el /*, fromIndex = 0 */){
    var O      = $.toObject(this)
      , length = $.toLength(O.length)
      , index  = $.toIndex(arguments[1], length)
      , value;
    if(IS_CONTAINS && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    } else for(;length > index; index++)if(IS_CONTAINS || index in O){
      if(O[index] === el)return IS_CONTAINS || index;
    } return !IS_CONTAINS && -1;
  }
}
},{"./$":12}],3:[function(require,module,exports){
'use strict';
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var $   = require('./$')
  , ctx = require('./$.ctx');
module.exports = function(TYPE){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX;
  return function(callbackfn/*, that = undefined */){
    var O      = Object($.assertDefined(this))
      , self   = $.ES5Object(O)
      , f      = ctx(callbackfn, arguments[1], 3)
      , length = $.toLength(self.length)
      , index  = 0
      , result = IS_MAP ? Array(length) : IS_FILTER ? [] : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  }
}
},{"./$":12,"./$.ctx":7}],4:[function(require,module,exports){
var $ = require('./$');
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
};
assert.def = $.assertDefined;
assert.fn = function(it){
  if(!$.isFunction(it))throw TypeError(it + ' is not a function!');
  return it;
};
assert.obj = function(it){
  if(!$.isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
assert.inst = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
module.exports = assert;
},{"./$":12}],5:[function(require,module,exports){
var $ = require('./$');
// 19.1.2.1 Object.assign(target, source, ...)
module.exports = Object.assign || function(target, source){
  var T = Object($.assertDefined(target))
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = $.ES5Object(arguments[i++])
      , keys   = $.getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
}
},{"./$":12}],6:[function(require,module,exports){
var $        = require('./$')
  , TAG      = require('./$.wks')('toStringTag')
  , toString = {}.toString;
function cof(it){
  return toString.call(it).slice(8, -1);
}
cof.classof = function(it){
  var O, T;
  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T : cof(O);
}
cof.set = function(it, tag, stat){
  if(it && !$.has(it = stat ? it : it.prototype, TAG))$.hide(it, TAG, tag);
}
module.exports = cof;
},{"./$":12,"./$.wks":22}],7:[function(require,module,exports){
// Optional / simple context binding
var assertFunction = require('./$.assert').fn;
module.exports = function(fn, that, length){
  assertFunction(fn);
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
}
},{"./$.assert":4}],8:[function(require,module,exports){
var $          = require('./$')
  , global     = $.g
  , core       = $.core
  , isFunction = $.isFunction;
function ctx(fn, that){
  return function(){
    return fn.apply(that, arguments);
  }
}
// type bitmap
$def.F = 1;  // forced
$def.G = 2;  // global
$def.S = 4;  // static
$def.P = 8;  // proto
$def.B = 16; // bind
$def.W = 32; // wrap
function $def(type, name, source){
  var key, own, out, exp
    , isGlobal = type & $def.G
    , target   = isGlobal ? global : (type & $def.S)
        ? global[name] : (global[name] || {}).prototype
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // contains in native
    own = !(type & $def.F) && target && key in target;
    // export native or passed
    out = (own ? target : source)[key];
    // prevent global pollution for namespaces
    if(isGlobal && !isFunction(target[key]))exp = source[key];
    // bind timers to global for call from export context
    else if(type & $def.B && own)exp = ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & $def.W && target[key] == out)!function(out){
      exp = function(param){
        return this instanceof out ? new out(param) : out(param);
      }
      exp.prototype = out.prototype;
    }(out);
    else exp = type & $def.P && isFunction(out) ? ctx(Function.call, out) : out;
    // export
    if(exports[key] != out)$.hide(exports, key, exp);
  }
}
module.exports = $def;
},{"./$":12}],9:[function(require,module,exports){
module.exports = function($){
  $.FW   = false;
  $.path = $.core;
  return $;
}
},{}],10:[function(require,module,exports){
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
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
},{}],11:[function(require,module,exports){
'use strict';
var $                 = require('./$')
  , ctx               = require('./$.ctx')
  , cof               = require('./$.cof')
  , $def              = require('./$.def')
  , assertObject      = require('./$.assert').obj
  , SYMBOL_ITERATOR   = require('./$.wks')('iterator')
  , FF_ITERATOR       = '@@iterator'
  , Iterators         = {}
  , IteratorPrototype = {};
// Safari has byggy iterators w/o `next`
var BUGGY = 'keys' in [] && !('next' in [].keys());
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, $.that);
function setIterator(O, value){
  $.hide(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  if(FF_ITERATOR in [])$.hide(O, FF_ITERATOR, value);
}
function createIterator(Constructor, NAME, next, proto){
  Constructor.prototype = $.create(proto || $iter.prototype, {next: $.desc(1, next)});
  cof.set(Constructor, NAME + ' Iterator');
}
function defineIterator(Constructor, NAME, value, DEFAULT){
  var proto = Constructor.prototype
    , iter  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || (DEFAULT && proto[DEFAULT]) || value;
  if($.FW){
    // Define iterator
    setIterator(proto, iter);
    if(iter !== value){
      var iterProto = $.getProto(iter.call(new Constructor));
      // Set @@toStringTag to native iterators
      cof.set(iterProto, NAME + ' Iterator', true);
      // FF fix
      $.has(proto, FF_ITERATOR) && setIterator(iterProto, $.that);
    }
  }
  // Plug for library
  Iterators[NAME] = iter;
  // FF & v8 fix
  Iterators[NAME + ' Iterator'] = $.that;
  return iter;
}
function getIterator(it){
  var Symbol  = $.g.Symbol
    , ext     = it[Symbol && Symbol.iterator || FF_ITERATOR]
    , getIter = ext || it[SYMBOL_ITERATOR] || Iterators[cof.classof(it)];
  return assertObject(getIter.call(it));
}
function closeIterator(iterator){
  var ret = iterator['return'];
  if(ret !== undefined)ret.call(iterator);
}
function stepCall(iterator, fn, value, entries){
  try {
    return entries ? fn(value[0], value[1]) : fn(value);
  } catch(e){
    closeIterator(iterator);
    throw e;
  }
}
var DANGER_CLOSING = true;
try {
  var iter = [1].keys();
  iter['return'] = function(){ DANGER_CLOSING = false };
  Array.from(iter, function(){ throw 2 });
} catch(e){}
var $iter = module.exports = {
  BUGGY: BUGGY,
  DANGER_CLOSING: DANGER_CLOSING,
  fail: function(exec){
    var fail = true
    try {
      var arr  = [[{}, 1]]
        , iter = arr[SYMBOL_ITERATOR]()
        , next = iter.next;
      iter.next = function(){
        fail = false;
        return next.call(this);
      }
      arr[SYMBOL_ITERATOR] = function(){
        return iter;
      }
      exec(arr);
    } catch(e){}
    return fail;
  },
  Iterators: Iterators,
  prototype: IteratorPrototype,
  step: function(done, value){
    return {value: value, done: !!done};
  },
  stepCall: stepCall,
  close: closeIterator,
  is: function(it){
    var O      = Object(it)
      , Symbol = $.g.Symbol
      , SYM    = Symbol && Symbol.iterator || FF_ITERATOR;
    return SYM in O || SYMBOL_ITERATOR in O || $.has(Iterators, cof.classof(O));
  },
  get: getIterator,
  set: setIterator,
  create: createIterator,
  define: defineIterator,
  std: function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
    function createIter(kind){
      return function(){
        return new Constructor(this, kind);
      }
    }
    createIterator(Constructor, NAME, next);
    var entries = createIter('key+value')
      , values  = createIter('value')
      , proto   = Base.prototype
      , methods, key;
    if(DEFAULT == 'value')values = defineIterator(Base, NAME, values, 'values');
    else entries = defineIterator(Base, NAME, entries, 'entries');
    if(DEFAULT){
      methods = {
        entries: entries,
        keys:    IS_SET ? values : createIter('key'),
        values:  values
      }
      $def($def.P + $def.F * BUGGY, NAME, methods);
      if(FORCE)for(key in methods){
        if(!(key in proto))$.hide(proto, key, methods[key]);
      }
    }
  },
  forOf: function(iterable, entries, fn, that){
    var iterator = getIterator(iterable)
      , f = ctx(fn, that, entries ? 2 : 1)
      , step;
    while(!(step = iterator.next()).done){
      if(stepCall(iterator, f, step.value, entries) === false){
        return closeIterator(iterator);
      }
    }
  }
};
},{"./$":12,"./$.assert":4,"./$.cof":6,"./$.ctx":7,"./$.def":8,"./$.wks":22}],12:[function(require,module,exports){
'use strict';
var global = typeof self != 'undefined' ? self : Function('return this')()
  , core   = {}
  , defineProperty = Object.defineProperty
  , hasOwnProperty = {}.hasOwnProperty
  , ceil  = Math.ceil
  , floor = Math.floor
  , max   = Math.max
  , min   = Math.min;
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){try {
  return defineProperty({}, 'a', {get: function(){ return 2 }}).a == 2;
} catch(e){}}();
var hide = createDefiner(1);
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
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

function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
function assertDefined(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
}

var $ = module.exports = require('./$.fw')({
  g: global,
  core: core,
  html: global.document && document.documentElement,
  // http://jsperf.com/core-js-isobject
  isObject:   isObject,
  isFunction: isFunction,
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
  // Dummy, fix for not array-like ES3 string in es5 module
  assertDefined: assertDefined,
  ES5Object: Object,
  toObject: function(it){
    return $.ES5Object(assertDefined(it));
  },
  hide: hide,
  def: createDefiner(0),
  set: global.Symbol ? simpleSet : hide,
  mix: function(target, src){
    for(var key in src)hide(target, key, src[key]);
    return target;
  },
  each: [].forEach
});
if(typeof __e != 'undefined')__e = core;
if(typeof __g != 'undefined')__g = global;
},{"./$.fw":9}],13:[function(require,module,exports){
var $ = require('./$');
module.exports = function(object, el){
  var O      = $.toObject(object)
    , keys   = $.getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
}
},{"./$":12}],14:[function(require,module,exports){
var $            = require('./$')
  , assertObject = require('./$.assert').obj;
module.exports = function(it){
  assertObject(it);
  return $.getSymbols ? $.getNames(it).concat($.getSymbols(it)) : $.getNames(it);
}
},{"./$":12,"./$.assert":4}],15:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , invoke = require('./$.invoke')
  , assertFunction = require('./$.assert').fn;
module.exports = function(/* ...pargs */){
  var fn     = assertFunction(this)
    , length = arguments.length
    , pargs  = Array(length)
    , i      = 0
    , _      = $.path._
    , holder = false;
  while(length > i)if((pargs[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that    = this
      , _length = arguments.length
      , i = 0, j = 0, args;
    if(!holder && !_length)return invoke(fn, pargs, that);
    args = pargs.slice();
    if(holder)for(;length > i; i++)if(args[i] === _)args[i] = arguments[j++];
    while(_length > j)args.push(arguments[j++]);
    return invoke(fn, args, that);
  }
}
},{"./$":12,"./$.assert":4,"./$.invoke":10}],16:[function(require,module,exports){
'use strict';
module.exports = function(regExp, replace, isStatic){
  var replacer = replace === Object(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  }
}
},{}],17:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't works with null proto objects.
var $      = require('./$')
  , assert = require('./$.assert');
module.exports = Object.setPrototypeOf || ('__proto__' in {} ? function(buggy, set){
  try {
    set = require('./$.ctx')(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
    set({}, []);
  } catch(e){ buggy = true }
  return function(O, proto){
    assert.obj(O);
    assert(proto === null || $.isObject(proto), proto, ": can't set as prototype!");
    if(buggy)O.__proto__ = proto;
    else set(O, proto);
    return O;
  }
}() : undefined);
},{"./$":12,"./$.assert":4,"./$.ctx":7}],18:[function(require,module,exports){
var $ = require('./$');
module.exports = function(C){
  if($.DESC && $.FW)$.setDesc(C, require('./$.wks')('species'), {
    configurable: true,
    get: $.that
  });
}
},{"./$":12,"./$.wks":22}],19:[function(require,module,exports){
'use strict';
// true  -> String#codePointAt
// false -> String#at
var $ = require('./$');
module.exports = function(TO_STRING){
  return function(pos){
    var s = String($.assertDefined(this))
      , i = $.toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  }
}
},{"./$":12}],20:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , ctx    = require('./$.ctx')
  , cof    = require('./$.cof')
  , invoke = require('./$.invoke')
  , global             = $.g
  , isFunction         = $.isFunction
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , postMessage        = global.postMessage
  , addEventListener   = global.addEventListener
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
function run(){
  var id = +this;
  if($.has(queue, id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
}
function listner(event){
  run.call(event.data);
}
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!isFunction(setTask) || !isFunction(clearTask)){
  setTask = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    }
    defer(counter);
    return counter;
  }
  clearTask = function(id){
    delete queue[id];
  }
  // Node.js 0.8-
  if(cof(global.process) == 'process'){
    defer = function(id){
      global.process.nextTick(ctx(run, id, 1));
    }
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(addEventListener && isFunction(postMessage) && !$.g.importScripts){
    defer = function(id){
      postMessage(id, '*');
    }
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if($.g.document && ONREADYSTATECHANGE in document.createElement('script')){
    defer = function(id){
      $.html.appendChild(document.createElement('script'))[ONREADYSTATECHANGE] = function(){
        $.html.removeChild(this);
        run.call(id);
      }
    }
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    }
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./$":12,"./$.cof":6,"./$.ctx":7,"./$.invoke":10}],21:[function(require,module,exports){
var sid = 0
function uid(key){
  return 'Symbol(' + key + ')_' + (++sid + Math.random()).toString(36);
}
uid.safe = require('./$').g.Symbol || uid;
module.exports = uid;
},{"./$":12}],22:[function(require,module,exports){
var global = require('./$').g
  , store  = {};
module.exports = function(name){
  return store[name] || (store[name] =
    (global.Symbol && global.Symbol[name]) || require('./$.uid').safe('Symbol.' + name));
}
},{"./$":12,"./$.uid":21}],23:[function(require,module,exports){
'use strict';
require('./es6.string.iterator');
require('./web.dom.iterable');
var $       = require('./$')
  , ctx     = require('./$.ctx')
  , safe    = require('./$.uid').safe
  , $def    = require('./$.def')
  , $iter   = require('./$.iter')
  , ENTRIES = safe('entries')
  , FN      = safe('fn')
  , ITER    = safe('iter')
  , forOf          = $iter.forOf
  , stepCall       = $iter.stepCall
  , getIterator    = $iter.get
  , setIterator    = $iter.set
  , createIterator = $iter.create;
function $for(iterable, entries){
  if(!(this instanceof $for))return new $for(iterable, entries);
  this[ITER]    = getIterator(iterable);
  this[ENTRIES] = !!entries;
}

createIterator($for, 'Wrapper', function(){
  return this[ITER].next();
});
var $forProto = $for.prototype;
setIterator($forProto, function(){
  return this[ITER]; // unwrap
});

function createChainIterator(next){
  function Iterator(iter, fn, that){
    this[ITER]    = getIterator(iter);
    this[ENTRIES] = iter[ENTRIES];
    this[FN]      = ctx(fn, that, iter[ENTRIES] ? 2 : 1);
  }
  createIterator(Iterator, 'Chain', next, $forProto);
  setIterator(Iterator.prototype, $.that); // override $forProto iterator
  return Iterator;
}

var MapIter = createChainIterator(function(){
  var step = this[ITER].next();
  return step.done ? step : $iter.step(0, stepCall(this[ITER], this[FN], step.value, this[ENTRIES]));
});

var FilterIter = createChainIterator(function(){
  for(;;){
    var step = this[ITER].next();
    if(step.done || stepCall(this[ITER], this[FN], step.value, this[ENTRIES]))return step;
  }
});

$.mix($forProto, {
  of: function(fn, that){
    forOf(this, this[ENTRIES], fn, that);
  },
  array: function(fn, that){
    var result = [];
    forOf(fn != undefined ? this.map(fn, that) : this, false, result.push, result);
    return result;
  },
  filter: function(fn, that){
    return new FilterIter(this, fn, that);
  },
  map: function(fn, that){
    return new MapIter(this, fn, that);
  }
});

$for.isIterable  = $iter.is;
$for.getIterator = getIterator;

$def($def.G + $def.F, {$for: $for});
},{"./$":12,"./$.ctx":7,"./$.def":8,"./$.iter":11,"./$.uid":21,"./es6.string.iterator":52,"./web.dom.iterable":63}],24:[function(require,module,exports){
'use strict';
var $              = require('./$')
  , $def           = require('./$.def')
  , UNSCOPABLES    = require('./$.wks')('unscopables')
  , assertFunction = require('./$.assert').fn;
$def($def.P + $def.F, 'Array', {
  turn: function(fn, target /* = [] */){
    assertFunction(fn);
    var memo   = target == undefined ? [] : Object(target)
      , O      = $.ES5Object(this)
      , length = $.toLength(O.length)
      , index  = 0;
    while(length > index)if(fn(memo, O[index], index++, this) === false)break;
    return memo;
  }
});
if($.FW && UNSCOPABLES in [])[][UNSCOPABLES].turn = true;
},{"./$":12,"./$.assert":4,"./$.def":8,"./$.wks":22}],25:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , ctx    = require('./$.ctx')
  , $def   = require('./$.def')
  , invoke = require('./$.invoke')
  , hide   = $.hide
  , assertFunction = require('./$.assert').fn
  // IE8- dirty hack - redefined toLocaleString is not enumerable
  , _ = $.DESC ? require('./$.uid')('tie') : 'toLocaleString'
  , toLocaleString = {}.toLocaleString;

// Placeholder
$.core._ = $.path._ = $.path._ || {};

$def($def.P + $def.F, 'Function', {
  part: require('./$.partial'),
  only: function(numberArguments, that /* = @ */){
    var fn     = assertFunction(this)
      , n      = $.toLength(numberArguments)
      , isThat = arguments.length > 1;
    return function(/* ...args */){
      var length = Math.min(n, arguments.length)
        , args   = Array(length)
        , i      = 0;
      while(length > i)args[i] = arguments[i++];
      return invoke(fn, args, isThat ? that : this);
    }
  }
});

function tie(key){
  var that  = this
    , bound = {};
  return hide(that, _, function(key){
    if(key === undefined || !(key in that))return toLocaleString.call(that);
    return $.has(bound, key) ? bound[key] : (bound[key] = ctx(that[key], that, -1));
  })[_](key);
}

hide($.path._, 'toString', function(){
  return _;
});

hide(Object.prototype, _, tie);
$.DESC || hide(Array.prototype, _, tie);
},{"./$":12,"./$.assert":4,"./$.ctx":7,"./$.def":8,"./$.invoke":10,"./$.partial":15,"./$.uid":21}],26:[function(require,module,exports){
var $            = require('./$')
  , $def         = require('./$.def')
  , core         = $.core
  , formatRegExp = /\b\w\w?\b/g
  , flexioRegExp = /:(.*)\|(.*)$/
  , locales      = {}
  , current      = 'en'
  , SECONDS      = 'Seconds'
  , MINUTES      = 'Minutes'
  , HOURS        = 'Hours'
  , DATE         = 'Date'
  , MONTH        = 'Month'
  , YEAR         = 'FullYear';
function createFormat(prefix){
  return function(template, locale /* = current */){
    var that = this
      , dict = locales[$.has(locales, locale) ? locale : current];
    function get(unit){
      return that[prefix + unit]();
    }
    return String(template).replace(formatRegExp, function(part){
      switch(part){
        case 's'  : return get(SECONDS);                  // Seconds : 0-59
        case 'ss' : return lz(get(SECONDS));              // Seconds : 00-59
        case 'm'  : return get(MINUTES);                  // Minutes : 0-59
        case 'mm' : return lz(get(MINUTES));              // Minutes : 00-59
        case 'h'  : return get(HOURS);                    // Hours   : 0-23
        case 'hh' : return lz(get(HOURS));                // Hours   : 00-23
        case 'D'  : return get(DATE);                     // Date    : 1-31
        case 'DD' : return lz(get(DATE));                 // Date    : 01-31
        case 'W'  : return dict[0][get('Day')];           // Day     : Понедельник
        case 'N'  : return get(MONTH) + 1;                // Month   : 1-12
        case 'NN' : return lz(get(MONTH) + 1);            // Month   : 01-12
        case 'M'  : return dict[2][get(MONTH)];           // Month   : Январь
        case 'MM' : return dict[1][get(MONTH)];           // Month   : Января
        case 'Y'  : return get(YEAR);                     // Year    : 2014
        case 'YY' : return lz(get(YEAR) % 100);           // Year    : 14
      } return part;
    });
  }
}
function lz(num){
  return num > 9 ? num : '0' + num;
}
function addLocale(lang, locale){
  function split(index){
    var result = [];
    $.each.call(locale.months.split(','), function(it){
      result.push(it.replace(flexioRegExp, '$' + index));
    });
    return result;
  }
  locales[lang] = [locale.weekdays.split(','), split(1), split(2)];
  return core;
}
$def($def.P + $def.F, DATE, {
  format:    createFormat('get'),
  formatUTC: createFormat('getUTC')
});
addLocale(current, {
  weekdays: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
  months: 'January,February,March,April,May,June,July,August,September,October,November,December'
});
addLocale('ru', {
  weekdays: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
  months: 'Январ:я|ь,Феврал:я|ь,Март:а|,Апрел:я|ь,Ма:я|й,Июн:я|ь,' +
          'Июл:я|ь,Август:а|,Сентябр:я|ь,Октябр:я|ь,Ноябр:я|ь,Декабр:я|ь'
});
core.locale = function(locale){
  return $.has(locales, locale) ? current = locale : current;
};
core.addLocale = addLocale;
},{"./$":12,"./$.def":8}],27:[function(require,module,exports){
var $       = require('./$')
  , $def    = require('./$.def')
  , partial = require('./$.partial');
// https://esdiscuss.org/topic/promise-returning-delay-function
$def($def.G + $def.F, {
  delay: function(time){
    return new ($.core.Promise || $.g.Promise)(function(resolve){
      setTimeout(partial.call(resolve, true), time);
    });
  }
});
},{"./$":12,"./$.def":8,"./$.partial":15}],28:[function(require,module,exports){
var $             = require('./$')
  , ctx           = require('./$.ctx')
  , $def          = require('./$.def')
  , assign        = require('./$.assign')
  , keyOf         = require('./$.keyof')
  , invoke        = require('./$.invoke')
  , ITER          = require('./$.uid').safe('iter')
  , REFERENCE_GET = require('./$.wks')('referenceGet')
  , assert        = require('./$.assert')
  , $iter         = require('./$.iter')
  , step          = $iter.step
  , getKeys       = $.getKeys
  , toObject      = $.toObject
  , has           = $.has;

function Dict(iterable){
  var dict = $.create(null);
  if(iterable != undefined){
    if($iter.is(iterable)){
      $iter.forOf(iterable, true, function(key, value){
        dict[key] = value;
      });
    } else assign(dict, iterable);
  }
  return dict;
}
Dict.prototype = null;
  
function DictIterator(iterated, kind){
  $.set(this, ITER, {o: toObject(iterated), a: getKeys(iterated), i: 0, k: kind});
}
$iter.create(DictIterator, 'Dict', function(){
  var iter = this[ITER]
    , O    = iter.o
    , keys = iter.a
    , kind = iter.k
    , key;
  do {
    if(iter.i >= keys.length){
      iter.o = undefined;
      return step(1);
    }
  } while(!has(O, key = keys[iter.i++]));
  if(kind == 'key')   return step(0, key);
  if(kind == 'value') return step(0, O[key]);
                      return step(0, [key, O[key]]);
});
function createDictIter(kind){
  return function(it){
    return new DictIterator(it, kind);
  }
}
function generic(A, B){
  // strange IE quirks mode bug -> use typeof instead of isFunction
  return typeof A == 'function' ? A : B;
}

// 0 -> Dict.forEach
// 1 -> Dict.map
// 2 -> Dict.filter
// 3 -> Dict.some
// 4 -> Dict.every
// 5 -> Dict.find
// 6 -> Dict.findKey
// 7 -> Dict.mapPairs
function createDictMethod(TYPE){
  var IS_MAP   = TYPE == 1
    , IS_EVERY = TYPE == 4;
  return function(object, callbackfn, that /* = undefined */){
    var f      = ctx(callbackfn, that, 3)
      , O      = toObject(object)
      , result = IS_MAP || TYPE == 7 || TYPE == 2 ? new (generic(this, Dict)) : undefined
      , key, val, res;
    for(key in O)if(has(O, key)){
      val = O[key];
      res = f(val, key, object);
      if(TYPE){
        if(IS_MAP)result[key] = res;            // map
        else if(res)switch(TYPE){
          case 2: result[key] = val; break      // filter
          case 3: return true;                  // some
          case 5: return val;                   // find
          case 6: return key;                   // findKey
          case 7: result[res[0]] = res[1];      // mapPairs
        } else if(IS_EVERY)return false;        // every
      }
    }
    return TYPE == 3 || IS_EVERY ? IS_EVERY : result;
  }
}

// true  -> Dict.turn
// false -> Dict.reduce
function createDictReduce(IS_TURN){
  return function(object, mapfn, init){
    assert.fn(mapfn);
    var O      = toObject(object)
      , keys   = getKeys(O)
      , length = keys.length
      , i      = 0
      , memo, key, result;
    if(IS_TURN)memo = init == undefined ? new (generic(this, Dict)) : Object(init);
    else if(arguments.length < 3){
      assert(length, 'Reduce of empty object with no initial value');
      memo = O[keys[i++]];
    } else memo = Object(init);
    while(length > i)if(has(O, key = keys[i++])){
      result = mapfn(memo, O[key], key, object);
      if(IS_TURN){
        if(result === false)break;
      } else memo = result;
    }
    return memo;
  }
}
var findKey = createDictMethod(6);

function includes(object, el){
  return (el == el ? keyOf(object, el) : findKey(object, function(it){
    return it != it;
  })) !== undefined;
}

var dictMethods = {
  keys:    createDictIter('key'),
  values:  createDictIter('value'),
  entries: createDictIter('key+value'),
  forEach: createDictMethod(0),
  map:     createDictMethod(1),
  filter:  createDictMethod(2),
  some:    createDictMethod(3),
  every:   createDictMethod(4),
  find:    createDictMethod(5),
  findKey: findKey,
  mapPairs:createDictMethod(7),
  reduce:  createDictReduce(false),
  turn:    createDictReduce(true),
  keyOf:   keyOf,
  includes:includes,
  // Has / get / set own property
  has: has,
  get: function(object, key){
    if(has(object, key))return object[key];
  },
  set: $.def,
  isDict: function(it){
    return $.isObject(it) && $.getProto(it) === Dict.prototype;
  }
};
for(var key in dictMethods)!function(fn){
  function method(){
    for(var args = [this], i = 0; i < arguments.length;)args.push(arguments[i++]);
    return invoke(fn, args);
  }
  fn[REFERENCE_GET] = function(){
    return method;
  }
}(dictMethods[key]);

$def($def.G + $def.F, {Dict: $.mix(Dict, dictMethods)});
},{"./$":12,"./$.assert":4,"./$.assign":5,"./$.ctx":7,"./$.def":8,"./$.invoke":10,"./$.iter":11,"./$.keyof":13,"./$.uid":21,"./$.wks":22}],29:[function(require,module,exports){
var $def = require('./$.def');
$def($def.G + $def.F, {global: require('./$').g});
},{"./$":12,"./$.def":8}],30:[function(require,module,exports){
var core  = require('./$').core
  , $iter = require('./$.iter');
core.isIterable  = $iter.is;
core.getIterator = $iter.get;
},{"./$":12,"./$.iter":11}],31:[function(require,module,exports){
var $    = require('./$')
  , $def = require('./$.def')
  , log  = {}
  , enabled = true;
// Methods from https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
$.each.call(('assert,clear,count,debug,dir,dirxml,error,exception,' +
    'group,groupCollapsed,groupEnd,info,isIndependentlyComposed,log,' +
    'markTimeline,profile,profileEnd,table,time,timeEnd,timeline,' +
    'timelineEnd,timeStamp,trace,warn').split(','), function(key){
  log[key] = function(){
    if(enabled && $.g.console && $.isFunction(console[key])){
      return Function.apply.call(console[key], console, arguments);
    }
  };
});
$def($def.G + $def.F, {log: require('./$.assign')(log.log, log, {
  enable: function(){
     enabled = true;
  },
  disable: function(){
    enabled = false;
  }
})});
},{"./$":12,"./$.assign":5,"./$.def":8}],32:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , ITER    = require('./$.uid').safe('iter')
  , $iter   = require('./$.iter')
  , step    = $iter.step
  , NUMBER  = 'Number';
function NumberIterator(iterated){
  $.set(this, ITER, {l: $.toLength(iterated), i: 0});
}
$iter.create(NumberIterator, NUMBER, function(){
  var iter = this[ITER]
    , i    = iter.i++;
  return i < iter.l ? step(0, i) : step(1);
});
$iter.define(Number, NUMBER, function(){
  return new NumberIterator(this);
});
},{"./$":12,"./$.iter":11,"./$.uid":21}],33:[function(require,module,exports){
'use strict';
var $def    = require('./$.def')
  , invoke  = require('./$.invoke')
  , methods = {};

methods.random = function(lim /* = 0 */){
  var a = +this
    , b = lim == undefined ? 0 : +lim
    , m = Math.min(a, b);
  return Math.random() * (Math.max(a, b) - m) + m;
};

require('./$').each.call((
    // ES3:
    'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,sqrt,max,min,pow,atan2,' +
    // ES6:
    'acosh,asinh,atanh,cbrt,clz32,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc'
  ).split(','), function(key){
    var fn = Math[key];
    if(fn)methods[key] = function(/* ...args */){
      // ie9- dont support strict mode & convert `this` to object -> convert it to number
      var args = [+this]
        , i    = 0;
      while(arguments.length > i)args.push(arguments[i++]);
      return invoke(fn, args);
    }
  }
);

$def($def.P + $def.F, 'Number', methods);
},{"./$":12,"./$.def":8,"./$.invoke":10}],34:[function(require,module,exports){
var $    = require('./$')
  , $def = require('./$.def')
  , ownKeys = require('./$.own-keys');
function define(target, mixin){
  var keys   = ownKeys($.toObject(mixin))
    , length = keys.length
    , i = 0, key;
  while(length > i)$.setDesc(target, key = keys[i++], $.getDesc(mixin, key));
  return target;
};
$def($def.S + $def.F, 'Object', {
  isObject: $.isObject,
  classof: require('./$.cof').classof,
  define: define,
  make: function(proto, mixin){
    return define($.create(proto), mixin);
  }
});
},{"./$":12,"./$.cof":6,"./$.def":8,"./$.own-keys":14}],35:[function(require,module,exports){
var $def     = require('./$.def')
  , replacer = require('./$.replacer');
var escapeHTMLDict = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
}, unescapeHTMLDict = {}, key;
for(key in escapeHTMLDict)unescapeHTMLDict[escapeHTMLDict[key]] = key;
$def($def.P + $def.F, 'String', {
  escapeHTML:   replacer(/[&<>"']/g, escapeHTMLDict),
  unescapeHTML: replacer(/&(?:amp|lt|gt|quot|apos);/g, unescapeHTMLDict)
});
},{"./$.def":8,"./$.replacer":16}],36:[function(require,module,exports){
var $                = require('./$')
  , cof              = require('./$.cof')
  , $def             = require('./$.def')
  , invoke           = require('./$.invoke')
  , arrayMethod      = require('./$.array-methods')
  , IE_PROTO         = require('./$.uid').safe('__proto__')
  , assert           = require('./$.assert')
  , assertObject     = assert.obj
  , ObjectProto      = Object.prototype
  , A                = []
  , slice            = A.slice
  , indexOf          = A.indexOf
  , classof          = cof.classof
  , defineProperties = Object.defineProperties
  , has              = $.has
  , defineProperty   = $.setDesc
  , getOwnDescriptor = $.getDesc
  , isFunction       = $.isFunction
  , toObject         = $.toObject
  , toLength         = $.toLength
  , IE8_DOM_DEFINE   = false;

if(!$.DESC){
  try {
    IE8_DOM_DEFINE = defineProperty(document.createElement('div'), 'x',
      {get: function(){return 8}}
    ).x == 8;
  } catch(e){}
  $.setDesc = function(O, P, A){
    if(IE8_DOM_DEFINE)try {
      return defineProperty(O, P, A);
    } catch(e){}
    if('get' in A || 'set' in A)throw TypeError('Accessors not supported!');
    if('value' in A)assertObject(O)[P] = A.value;
    return O;
  };
  $.getDesc = function(O, P){
    if(IE8_DOM_DEFINE)try {
      return getOwnDescriptor(O, P);
    } catch(e){}
    if(has(O, P))return $.desc(!ObjectProto.propertyIsEnumerable.call(O, P), O[P]);
  };
  defineProperties = function(O, Properties){
    assertObject(O);
    var keys   = $.getKeys(Properties)
      , length = keys.length
      , i = 0
      , P;
    while(length > i)$.setDesc(O, P = keys[i++], Properties[P]);
    return O;
  };
}
$def($def.S + $def.F * !$.DESC, 'Object', {
  // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $.getDesc,
  // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
  defineProperty: $.setDesc,
  // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties) 
  defineProperties: defineProperties
});

  // IE 8- don't enum bug keys
var keys1 = 'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'.split(',')
  // Additional keys for getOwnPropertyNames
  , keys2 = keys1.concat('length', 'prototype')
  , keysLen1 = keys1.length;

// Create object with `null` prototype: use iframe Object with cleared prototype
function createDict(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = document.createElement('iframe')
    , i      = keysLen1
    , iframeDocument;
  iframe.style.display = 'none';
  $.html.appendChild(iframe);
  iframe.src = 'javascript:';
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write('<script>document.F=Object</script>');
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict.prototype[keys1[i]];
  return createDict();
}
function createGetKeys(names, length, isNames){
  return function(object){
    var O      = toObject(object)
      , i      = 0
      , result = []
      , key;
    for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while(length > i)if(has(O, key = names[i++])){
      ~indexOf.call(result, key) || result.push(key);
    }
    return result;
  }
}
function isPrimitive(it){ return !$.isObject(it) }
function Empty(){}
$def($def.S, 'Object', {
  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
  getPrototypeOf: $.getProto = $.getProto || function(O){
    O = Object(assert.def(O));
    if(has(O, IE_PROTO))return O[IE_PROTO];
    if(isFunction(O.constructor) && O instanceof O.constructor){
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectProto : null;
  },
  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $.getNames = $.getNames || createGetKeys(keys2, keys2.length, true),
  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
  create: $.create = $.create || function(O, /*?*/Properties){
    var result
    if(O !== null){
      Empty.prototype = assertObject(O);
      result = new Empty();
      Empty.prototype = null;
      // add "__proto__" for Object.getPrototypeOf shim
      result[IE_PROTO] = O;
    } else result = createDict();
    return Properties === undefined ? result : defineProperties(result, Properties);
  },
  // 19.1.2.14 / 15.2.3.14 Object.keys(O)
  keys: $.getKeys = $.getKeys || createGetKeys(keys1, keysLen1, false),
  // 19.1.2.17 / 15.2.3.8 Object.seal(O)
  seal: $.it, // <- cap
  // 19.1.2.5 / 15.2.3.9 Object.freeze(O)
  freeze: $.it, // <- cap
  // 19.1.2.15 / 15.2.3.10 Object.preventExtensions(O)
  preventExtensions: $.it, // <- cap
  // 19.1.2.13 / 15.2.3.11 Object.isSealed(O)
  isSealed: isPrimitive, // <- cap
  // 19.1.2.12 / 15.2.3.12 Object.isFrozen(O)
  isFrozen: isPrimitive, // <- cap
  // 19.1.2.11 / 15.2.3.13 Object.isExtensible(O)
  isExtensible: $.isObject // <- cap
});

// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
$def($def.P, 'Function', {
  bind: function(that /*, args... */){
    var fn       = assert.fn(this)
      , partArgs = slice.call(arguments, 1);
    function bound(/* args... */){
      var args = partArgs.concat(slice.call(arguments));
      return invoke(fn, args, this instanceof bound ? $.create(fn.prototype) : that);
    }
    if(fn.prototype)bound.prototype = fn.prototype;
    return bound;
  }
});

// Fix for not array-like ES3 string
function arrayMethodFix(fn){
  return function(){
    return fn.apply($.ES5Object(this), arguments);
  }
}
if(!(0 in Object('z') && 'z'[0] == 'z')){
  $.ES5Object = function(it){
    return cof(it) == 'String' ? it.split('') : Object(it);
  }
}
$def($def.P + $def.F * ($.ES5Object != Object), 'Array', {
  slice: arrayMethodFix(slice),
  join: arrayMethodFix(A.join)
});

// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
$def($def.S, 'Array', {
  isArray: function(arg){
    return cof(arg) == 'Array'
  }
});
function createArrayReduce(isRight){
  return function(callbackfn, memo){
    assert.fn(callbackfn);
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = isRight ? length - 1 : 0
      , i      = isRight ? -1 : 1;
    if(2 > arguments.length)for(;;){
      if(index in O){
        memo = O[index];
        index += i;
        break;
      }
      index += i;
      assert(isRight ? index >= 0 : length > index, 'Reduce of empty array with no initial value');
    }
    for(;isRight ? index >= 0 : length > index; index += i)if(index in O){
      memo = callbackfn(memo, O[index], index, this);
    }
    return memo;
  }
}
$def($def.P, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: $.each = $.each || arrayMethod(0),
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: arrayMethod(1),
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: arrayMethod(2),
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: arrayMethod(3),
  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
  every: arrayMethod(4),
  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
  reduce: createArrayReduce(false),
  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
  reduceRight: createArrayReduce(true),
  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
  indexOf: indexOf = indexOf || require('./$.array-includes')(false),
  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
  lastIndexOf: function(el, fromIndex /* = @[*-1] */){
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = length - 1;
    if(arguments.length > 1)index = Math.min(index, $.toInteger(fromIndex));
    if(index < 0)index = toLength(length + index);
    for(;index >= 0; index--)if(index in O)if(O[index] === el)return index;
    return -1;
  }
});

// 21.1.3.25 / 15.5.4.20 String.prototype.trim()
$def($def.P, 'String', {trim: require('./$.replacer')(/^\s*([\s\S]*\S)?\s*$/, '$1')});

// 20.3.3.1 / 15.9.4.4 Date.now()
$def($def.S, 'Date', {now: function(){
  return +new Date;
}});

function lz(num){
  return num > 9 ? num : '0' + num;
}
// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
$def($def.P, 'Date', {toISOString: function(){
  if(!isFinite(this))throw RangeError('Invalid time value');
  var d = this
    , y = d.getUTCFullYear()
    , m = d.getUTCMilliseconds()
    , s = y < 0 ? '-' : y > 9999 ? '+' : '';
  return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
    '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
    'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
    ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
}});

if(classof(function(){return arguments}()) == 'Object')cof.classof = function(it){
  var cof = classof(it);
  return cof == 'Object' && isFunction(it.callee) ? 'Arguments' : cof;
}
},{"./$":12,"./$.array-includes":2,"./$.array-methods":3,"./$.assert":4,"./$.cof":6,"./$.def":8,"./$.invoke":10,"./$.replacer":16,"./$.uid":21}],37:[function(require,module,exports){
require('./es6.string.iterator');
var $     = require('./$')
  , ctx   = require('./$.ctx')
  , $def  = require('./$.def')
  , $iter = require('./$.iter')
  , stepCall = $iter.stepCall
  , assertDefined = $.assertDefined;
$def($def.S + $def.F * $iter.DANGER_CLOSING, 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = Object(assertDefined(arrayLike))
      , mapfn   = arguments[1]
      , mapping = mapfn !== undefined
      , f       = mapping ? ctx(mapfn, arguments[2], 2) : undefined
      , index   = 0
      , length, result, step, iterator;
    if($iter.is(O)){
      iterator = $iter.get(O);
      // strange IE quirks mode bug -> use typeof instead of isFunction
      result   = new (typeof this == 'function' ? this : Array);
      for(; !(step = iterator.next()).done; index++){
        result[index] = mapping ? stepCall(iterator, f, [step.value, index], true) : step.value;
      }
    } else {
      // strange IE quirks mode bug -> use typeof instead of isFunction
      result = new (typeof this == 'function' ? this : Array)(length = $.toLength(O.length));
      for(; length > index; index++){
        result[index] = mapping ? f(O[index], index) : O[index];
      }
    }
    result.length = index;
    return result;
  }
});
},{"./$":12,"./$.ctx":7,"./$.def":8,"./$.iter":11,"./es6.string.iterator":52}],38:[function(require,module,exports){
var $     = require('./$')
  , ITER  = require('./$.uid').safe('iter')
  , $iter = require('./$.iter')
  , step  = $iter.step
  , Iterators = $iter.Iterators;

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
$iter.std(Array, 'Array', function(iterated, kind){
  $.set(this, ITER, {o: $.toObject(iterated), i: 0, k: kind});
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , kind  = iter.k
    , index = iter.i++;
  if(!O || index >= O.length){
    iter.o = undefined;
    return step(1);
  }
  if(kind == 'key')   return step(0, index);
  if(kind == 'value') return step(0, O[index]);
                      return step(0, [index, O[index]]);
}, 'value');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;
},{"./$":12,"./$.iter":11,"./$.uid":21}],39:[function(require,module,exports){
var $def = require('./$.def');
$def($def.S, 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function(/* ...args */){
    var index  = 0
      , length = arguments.length
      // strange IE quirks mode bug -> use typeof instead of isFunction
      , result = new (typeof this == 'function' ? this : Array)(length);
    while(length > index)result[index] = arguments[index++];
    result.length = length;
    return result;
  }
});
},{"./$.def":8}],40:[function(require,module,exports){
'use strict';
var $                = require('./$')
  , $def             = require('./$.def')
  , arrayMethod      = require('./$.array-methods')
  , UNSCOPABLES      = require('./$.wks')('unscopables')
  , assertDefined    = $.assertDefined
  , toIndex          = $.toIndex
  , toLength         = $.toLength
  , ArrayProto       = Array.prototype
  , ArrayUnscopables = ArrayProto[UNSCOPABLES] || {};
$def($def.P, 'Array', {
  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
  copyWithin: function(target /* = 0 */, start /* = 0, end = @length */){
    var O     = Object(assertDefined(this))
      , len   = toLength(O.length)
      , to    = toIndex(target, len)
      , from  = toIndex(start, len)
      , end   = arguments[2]
      , fin   = end === undefined ? len : toIndex(end, len)
      , count = Math.min(fin - from, len - to)
      , inc   = 1;
    if(from < to && to < from + count){
      inc  = -1;
      from = from + count - 1;
      to   = to + count - 1;
    }
    while(count-- > 0){
      if(from in O)O[to] = O[from];
      else delete O[to];
      to += inc;
      from += inc;
    } return O;
  },
  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
  fill: function(value /*, start = 0, end = @length */){
    var O      = Object(assertDefined(this))
      , length = toLength(O.length)
      , index  = toIndex(arguments[1], length)
      , end    = arguments[2]
      , endPos = end === undefined ? length : toIndex(end, length);
    while(endPos > index)O[index++] = value;
    return O;
  },
  // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
  find: arrayMethod(5),
  // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
  findIndex: arrayMethod(6)
});

if($.FW){
  // 22.1.3.31 Array.prototype[@@unscopables]
  $.each.call('find,findIndex,fill,copyWithin,entries,keys,values'.split(','), function(it){
    ArrayUnscopables[it] = true;
  });
  UNSCOPABLES in ArrayProto || $.hide(ArrayProto, UNSCOPABLES, ArrayUnscopables);
}
},{"./$":12,"./$.array-methods":3,"./$.def":8,"./$.wks":22}],41:[function(require,module,exports){
require('./$.species')(Array);
},{"./$.species":18}],42:[function(require,module,exports){
'use strict';
require('./es6.string.iterator');
require('./web.dom.iterable');
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , cof      = require('./$.cof')
  , $def     = require('./$.def')
  , safe     = require('./$.uid').safe
  , $iter    = require('./$.iter')
  , assert   = require('./$.assert')
  , assertInstanse = assert.inst
  , has      = $.has
  , set      = $.set
  , isObject = $.isObject
  , hide     = $.hide
  , step     = $iter.step
  , isFrozen = Object.isFrozen || $.core.Object.isFrozen
  , CID      = safe('cid')
  , O1       = safe('O1')
  , WEAK     = safe('weak')
  , LEAK     = safe('leak')
  , LAST     = safe('last')
  , FIRST    = safe('first')
  , ITER     = safe('iter')
  , SIZE     = $.DESC ? safe('size') : 'size'
  , cid      = 0
  , tmp      = {};

function getCollection(NAME, methods, commonMethods, isMap, isWeak){
  var Base  = $.g[NAME]
    , C     = Base
    , ADDER = isMap ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  function initFromIterable(that, iterable){
    if(iterable != undefined)$iter.forOf(iterable, isMap, that[ADDER], that);
    return that;
  }
  function fixSVZ(key, chain){
    var method = proto[key];
    if($.FW)proto[key] = function(a, b){
      var result = method.call(this, a === 0 ? 0 : a, b);
      return chain ? this : result;
    };
  }
  if(!$.isFunction(C) || !(isWeak || (!$iter.BUGGY && proto.forEach && proto.entries))){
    // create collection constructor
    C = isWeak
      ? function(iterable){
          set(assertInstanse(this, C, NAME), CID, cid++);
          initFromIterable(this, iterable);
        }
      : function(iterable){
          var that = assertInstanse(this, C, NAME);
          set(that, O1, $.create(null));
          set(that, SIZE, 0);
          set(that, LAST, undefined);
          set(that, FIRST, undefined);
          initFromIterable(that, iterable);
        };
    $.mix($.mix(C.prototype, methods), commonMethods);
    isWeak || !$.DESC || $.setDesc(C.prototype, 'size', {get: function(){
      return assert.def(this[SIZE]);
    }});
  } else {
    var Native = C
      , inst   = new C
      , chain  = inst[ADDER](isWeak ? {} : -0, 1)
      , buggyZero;
    // wrap to init collections from iterable
    if($iter.fail(function(iter){ new C(iter) }) || $iter.DANGER_CLOSING){
      C = function(iterable){
        assertInstanse(this, C, NAME);
        return initFromIterable(new Native, iterable);
      }
      C.prototype = proto;
      if($.FW)proto.constructor = C;
    }
    isWeak || inst.forEach(function(val, key){
      buggyZero = 1 / key === -Infinity;
    });
    // fix converting -0 key to +0
    if(buggyZero){
      fixSVZ('delete');
      fixSVZ('has');
      isMap && fixSVZ('get');
    }
    // + fix .add & .set for chaining
    if(buggyZero || chain !== inst)fixSVZ(ADDER, true);
  }
  cof.set(C, NAME);
  require('./$.species')(C);
  
  O[NAME] = C;
  $def($def.G + $def.W + $def.F * (C != Base), O);
  
  // add .keys, .values, .entries, [@@iterator]
  // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
  isWeak || $iter.std(C, NAME, function(iterated, kind){
    set(this, ITER, {o: iterated, k: kind});
  }, function(){
    var iter  = this[ITER]
      , kind  = iter.k
      , entry = iter.l;
    // revert to the last existing entry
    while(entry && entry.r)entry = entry.p;
    // get next entry
    if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
      // or finish the iteration
      iter.o = undefined;
      return step(1);
    }
    // return step by kind
    if(kind == 'key')   return step(0, entry.k);
    if(kind == 'value') return step(0, entry.v);
                        return step(0, [entry.k, entry.v]);   
  }, isMap ? 'key+value' : 'value', !isMap, true);
  
  return C;
}

function fastKey(it, create){
  // return primitive with prefix
  if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
  // can't set id to frozen object
  if(isFrozen(it))return 'F';
  if(!has(it, CID)){
    // not necessary to add id
    if(!create)return 'E';
    // add missing object id
    hide(it, CID, ++cid);
  // return object id with prefix
  } return 'O' + it[CID];
}
function getEntry(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index != 'F')return that[O1][index];
  // frozen object case
  for(entry = that[FIRST]; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
}
function def(that, key, value){
  var entry = getEntry(that, key)
    , prev, index;
  // change existing entry
  if(entry)entry.v = value;
  // create new entry
  else {
    that[LAST] = entry = {
      i: index = fastKey(key, true), // <- index
      k: key,                        // <- key
      v: value,                      // <- value
      p: prev = that[LAST],          // <- previous entry
      n: undefined,                  // <- next entry
      r: false                       // <- removed
    };
    if(!that[FIRST])that[FIRST] = entry;
    if(prev)prev.n = entry;
    that[SIZE]++;
    // add to index
    if(index != 'F')that[O1][index] = entry;
  } return that;
}

var collectionMethods = {
  // 23.1.3.1 Map.prototype.clear()
  // 23.2.3.2 Set.prototype.clear()
  clear: function(){
    for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
      entry.r = true;
      if(entry.p)entry.p = entry.p.n = undefined;
      delete data[entry.i];
    }
    that[FIRST] = that[LAST] = undefined;
    that[SIZE] = 0;
  },
  // 23.1.3.3 Map.prototype.delete(key)
  // 23.2.3.4 Set.prototype.delete(value)
  'delete': function(key){
    var that  = this
      , entry = getEntry(that, key);
    if(entry){
      var next = entry.n
        , prev = entry.p;
      delete that[O1][entry.i];
      entry.r = true;
      if(prev)prev.n = next;
      if(next)next.p = prev;
      if(that[FIRST] == entry)that[FIRST] = next;
      if(that[LAST] == entry)that[LAST] = prev;
      that[SIZE]--;
    } return !!entry;
  },
  // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
  // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
  forEach: function(callbackfn /*, that = undefined */){
    var f = ctx(callbackfn, arguments[1], 3)
      , entry;
    while(entry = entry ? entry.n : this[FIRST]){
      f(entry.v, entry.k, this);
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
    }
  },
  // 23.1.3.7 Map.prototype.has(key)
  // 23.2.3.7 Set.prototype.has(value)
  has: function(key){
    return !!getEntry(this, key);
  }
}

// 23.1 Map Objects
var Map = getCollection('Map', {
  // 23.1.3.6 Map.prototype.get(key)
  get: function(key){
    var entry = getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function(key, value){
    return def(this, key === 0 ? 0 : key, value);
  }
}, collectionMethods, true);

// 23.2 Set Objects
getCollection('Set', {
  // 23.2.3.1 Set.prototype.add(value)
  add: function(value){
    return def(this, value = value === 0 ? 0 : value, value);
  }
}, collectionMethods);

function defWeak(that, key, value){
  if(isFrozen(assert.obj(key)))leakStore(that).set(key, value);
  else {
    has(key, WEAK) || hide(key, WEAK, {});
    key[WEAK][that[CID]] = value;
  } return that;
}
function leakStore(that){
  return that[LEAK] || hide(that, LEAK, new Map)[LEAK];
}

var weakMethods = {
  // 23.3.3.2 WeakMap.prototype.delete(key)
  // 23.4.3.3 WeakSet.prototype.delete(value)
  'delete': function(key){
    if(!isObject(key))return false;
    if(isFrozen(key))return leakStore(this)['delete'](key);
    return has(key, WEAK) && has(key[WEAK], this[CID]) && delete key[WEAK][this[CID]];
  },
  // 23.3.3.4 WeakMap.prototype.has(key)
  // 23.4.3.4 WeakSet.prototype.has(value)
  has: function(key){
    if(!isObject(key))return false;
    if(isFrozen(key))return leakStore(this).has(key);
    return has(key, WEAK) && has(key[WEAK], this[CID]);
  }
};

// 23.3 WeakMap Objects
var WeakMap = getCollection('WeakMap', {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function(key){
    if(isObject(key)){
      if(isFrozen(key))return leakStore(this).get(key);
      if(has(key, WEAK))return key[WEAK][this[CID]];
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function(key, value){
    return defWeak(this, key, value);
  }
}, weakMethods, true, true);

// IE11 WeakMap frozen keys fix
if($.FW && new WeakMap().set(Object.freeze(tmp), 7).get(tmp) != 7){
  $.each.call(['delete', 'has', 'get', 'set'], function(key){
    var method = WeakMap.prototype[key];
    WeakMap.prototype[key] = function(a, b){
      // store frozen objects on leaky map
      if(isObject(a) && isFrozen(a)){
        var result = leakStore(this)[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    };
  });
}

// 23.4 WeakSet Objects
getCollection('WeakSet', {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function(value){
    return defWeak(this, value, true);
  }
}, weakMethods, false, true);
},{"./$":12,"./$.assert":4,"./$.cof":6,"./$.ctx":7,"./$.def":8,"./$.iter":11,"./$.species":18,"./$.uid":21,"./es6.string.iterator":52,"./web.dom.iterable":63}],43:[function(require,module,exports){
var Infinity = 1 / 0
  , $def  = require('./$.def')
  , E     = Math.E
  , pow   = Math.pow
  , abs   = Math.abs
  , exp   = Math.exp
  , log   = Math.log
  , sqrt  = Math.sqrt
  , ceil  = Math.ceil
  , floor = Math.floor
  , sign  = Math.sign || function(x){
      return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
    };

// 20.2.2.5 Math.asinh(x)
function asinh(x){
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
}
// 20.2.2.14 Math.expm1(x)
function expm1(x){
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
}
  
$def($def.S, 'Math', {
  // 20.2.2.3 Math.acosh(x)
  acosh: function(x){
    return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
  },
  // 20.2.2.5 Math.asinh(x)
  asinh: asinh,
  // 20.2.2.7 Math.atanh(x)
  atanh: function(x){
    return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
  },
  // 20.2.2.9 Math.cbrt(x)
  cbrt: function(x){
    return sign(x = +x) * pow(abs(x), 1 / 3);
  },
  // 20.2.2.11 Math.clz32(x)
  clz32: function(x){
    return (x >>>= 0) ? 32 - x.toString(2).length : 32;
  },
  // 20.2.2.12 Math.cosh(x)
  cosh: function(x){
    return (exp(x = +x) + exp(-x)) / 2;
  },
  // 20.2.2.14 Math.expm1(x)
  expm1: expm1,
  // 20.2.2.16 Math.fround(x)
  // TODO: fallback for IE9-
  fround: function(x){
    return new Float32Array([x])[0];
  },
  // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
  hypot: function(value1, value2){
    var sum  = 0
      , len1 = arguments.length
      , len2 = len1
      , args = Array(len1)
      , larg = -Infinity
      , arg;
    while(len1--){
      arg = args[len1] = +arguments[len1];
      if(arg == Infinity || arg == -Infinity)return Infinity;
      if(arg > larg)larg = arg;
    }
    larg = arg || 1;
    while(len2--)sum += pow(args[len2] / larg, 2);
    return larg * sqrt(sum);
  },
  // 20.2.2.18 Math.imul(x, y)
  imul: function(x, y){
    var UInt16 = 0xffff
      , xn = +x
      , yn = +y
      , xl = UInt16 & xn
      , yl = UInt16 & yn;
    return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
  },
  // 20.2.2.20 Math.log1p(x)
  log1p: function(x){
    return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
  },
  // 20.2.2.21 Math.log10(x)
  log10: function(x){
    return log(x) / Math.LN10;
  },
  // 20.2.2.22 Math.log2(x)
  log2: function(x){
    return log(x) / Math.LN2;
  },
  // 20.2.2.28 Math.sign(x)
  sign: sign,
  // 20.2.2.30 Math.sinh(x)
  sinh: function(x){
    return (abs(x = +x) < 1) ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
  },
  // 20.2.2.33 Math.tanh(x)
  tanh: function(x){
    var a = expm1(x = +x)
      , b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  },
  // 20.2.2.34 Math.trunc(x)
  trunc: function(it){
    return (it > 0 ? floor : ceil)(it);
  }
});
},{"./$.def":8}],44:[function(require,module,exports){
var $     = require('./$')
  , $def  = require('./$.def')
  , abs   = Math.abs
  , floor = Math.floor
  , MAX_SAFE_INTEGER = 0x1fffffffffffff // pow(2, 53) - 1 == 9007199254740991;
function isInteger(it){
  return !$.isObject(it) && isFinite(it) && floor(it) === it;
}
$def($def.S, 'Number', {
  // 20.1.2.1 Number.EPSILON
  EPSILON: Math.pow(2, -52),
  // 20.1.2.2 Number.isFinite(number)
  isFinite: function(it){
    return typeof it == 'number' && isFinite(it);
  },
  // 20.1.2.3 Number.isInteger(number)
  isInteger: isInteger,
  // 20.1.2.4 Number.isNaN(number)
  isNaN: function(number){
    return number != number;
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
},{"./$":12,"./$.def":8}],45:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $def = require('./$.def');
$def($def.S, 'Object', {assign: require('./$.assign')});
},{"./$.assign":5,"./$.def":8}],46:[function(require,module,exports){
// 19.1.3.10 Object.is(value1, value2)
var $def = require('./$.def');
$def($def.S, 'Object', {
  is: function(x, y){
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  }
});
},{"./$.def":8}],47:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $def = require('./$.def');
$def($def.S, 'Object', {setPrototypeOf: require('./$.set-proto')});
},{"./$.def":8,"./$.set-proto":17}],48:[function(require,module,exports){
var $        = require('./$')
  , $def     = require('./$.def')
  , isObject = $.isObject
  , toObject = $.toObject;
function wrapObjectMethod(key, MODE){
  var fn  = ($.core.Object || {})[key] || Object[key]
    , f   = 0
    , o   = {};
  o[key] = MODE == 1 ? function(it){
    return isObject(it) ? fn(it) : it;
  } : MODE == 2 ? function(it){
    return isObject(it) ? fn(it) : true;
  } : MODE == 3 ? function(it){
    return isObject(it) ? fn(it) : false;
  } : MODE == 4 ? function(it, key){
    return fn(toObject(it), key);
  } : function(it){
    return fn(toObject(it));
  };
  try { fn('z') }
  catch(e){ f = 1 }
  $def($def.S + $def.F * f, 'Object', o);
}
wrapObjectMethod('freeze', 1);
wrapObjectMethod('seal', 1);
wrapObjectMethod('preventExtensions', 1);
wrapObjectMethod('isFrozen', 2);
wrapObjectMethod('isSealed', 2);
wrapObjectMethod('isExtensible', 3);
wrapObjectMethod('getOwnPropertyDescriptor', 4);
wrapObjectMethod('getPrototypeOf');
wrapObjectMethod('keys');
wrapObjectMethod('getOwnPropertyNames');
},{"./$":12,"./$.def":8}],49:[function(require,module,exports){
'use strict';
require('./es6.string.iterator');
require('./web.dom.iterable');
var $       = require('./$')
  , ctx     = require('./$.ctx')
  , cof     = require('./$.cof')
  , $def    = require('./$.def')
  , assert  = require('./$.assert')
  , $iter   = require('./$.iter')
  , SPECIES = require('./$.wks')('species')
  , RECORD  = require('./$.uid').safe('record')
  , forOf   = $iter.forOf
  , PROMISE = 'Promise'
  , global  = $.g
  , process = global.process
  , asap    = process && process.nextTick || require('./$.task').set
  , Promise = global[PROMISE]
  , Base    = Promise
  , isFunction     = $.isFunction
  , isObject       = $.isObject
  , assertFunction = assert.fn
  , assertObject   = assert.obj
  , test;
function getConstructor(C){
  var S = assertObject(C)[SPECIES];
  return S != undefined ? S : C;
}
isFunction(Promise) && isFunction(Promise.resolve)
&& Promise.resolve(test = new Promise(function(){})) == test
|| function(){
  function isThenable(it){
    var then;
    if(isObject(it))then = it.then;
    return isFunction(then) ? then : false;
  }
  function handledRejectionOrHasOnRejected(promise){
    var record = promise[RECORD]
      , chain  = record.c
      , i      = 0
      , react;
    if(record.h)return true;
    while(chain.length > i){
      react = chain[i++];
      if(react.fail || handledRejectionOrHasOnRejected(react.P))return true;
    }
  }
  function notify(record, reject){
    var chain = record.c;
    if(reject || chain.length)asap(function(){
      var promise = record.p
        , value   = record.v
        , ok      = record.s == 1
        , i       = 0;
      if(reject && !handledRejectionOrHasOnRejected(promise)){
        setTimeout(function(){
          if(!handledRejectionOrHasOnRejected(promise)){
            if(cof(process) == 'process'){
              if(!process.emit('unhandledRejection', value, promise)){
                // default node.js behavior
              }
            } else if(global.console && isFunction(console.error)){
              console.error('Unhandled promise rejection', value);
            }
          }
        }, 1e3);
      } else while(chain.length > i)!function(react){
        var cb = ok ? react.ok : react.fail
          , ret, then;
        try {
          if(cb){
            if(!ok)record.h = true;
            ret = cb === true ? value : cb(value);
            if(ret === react.P){
              react.rej(TypeError(PROMISE + '-chain cycle'));
            } else if(then = isThenable(ret)){
              then.call(ret, react.res, react.rej);
            } else react.res(ret);
          } else react.rej(value);
        } catch(err){
          react.rej(err);
        }
      }(chain[i++]);
      chain.length = 0;
    });
  }
  function resolve(value){
    var record = this
      , then, wrapper;
    if(record.d)return;
    record.d = true;
    record = record.r || record; // unwrap
    try {
      if(then = isThenable(value)){
        wrapper = {r: record, d: false}; // wrap
        then.call(value, ctx(resolve, wrapper, 1), ctx(reject, wrapper, 1));
      } else {
        record.v = value;
        record.s = 1;
        notify(record);
      }
    } catch(err){
      reject.call(wrapper || {r: record, d: false}, err); // wrap
    }
  }
  function reject(value){
    var record = this;
    if(record.d)return;
    record.d = true;
    record = record.r || record; // unwrap
    record.v = value;
    record.s = 2;
    notify(record, true);
  }
  // 25.4.3.1 Promise(executor)
  Promise = function(executor){
    assertFunction(executor);
    var record = {
      p: assert.inst(this, Promise, PROMISE), // <- promise
      c: [],                                  // <- chain
      s: 0,                                   // <- state
      d: false,                               // <- done
      v: undefined,                           // <- value
      h: false                                // <- handled rejection
    };
    $.hide(this, RECORD, record);
    try {
      executor(ctx(resolve, record, 1), ctx(reject, record, 1));
    } catch(err){
      reject.call(record, err);
    }
  }
  $.mix(Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function(onFulfilled, onRejected){
      var S = assertObject(assertObject(this).constructor)[SPECIES];
      var react = {
        ok:   isFunction(onFulfilled) ? onFulfilled : true,
        fail: isFunction(onRejected)  ? onRejected  : false
      } , P = react.P = new (S != undefined ? S : Promise)(function(resolve, reject){
        react.res = assertFunction(resolve);
        react.rej = assertFunction(reject);
      }), record = this[RECORD];
      record.c.push(react);
      record.s && notify(record);
      return P;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
  $.mix(Promise, {
    // 25.4.4.5 Promise.reject(r)
    reject: function(r){
      return new (getConstructor(this))(function(resolve, reject){
        reject(r);
      });
    },
    // 25.4.4.6 Promise.resolve(x)
    resolve: function(x){
      return isObject(x) && RECORD in x && $.getProto(x) === this.prototype
        ? x : new (getConstructor(this))(function(resolve, reject){
          resolve(x);
        });
    }
  });
}();
$def($def.G + $def.W + $def.F * (Promise != Base), {Promise: Promise});
$def($def.S + $def.F * ($iter.fail(function(iter){
  Promise.all(iter)['catch'](function(){});
}) || $iter.DANGER_CLOSING), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function(iterable){
    var Promise = getConstructor(this)
      , values  = [];
    return new Promise(function(resolve, reject){
      forOf(iterable, false, values.push, values);
      var remaining = values.length
        , results   = Array(remaining);
      if(remaining)$.each.call(values, function(promise, index){
        Promise.resolve(promise).then(function(value){
          results[index] = value;
          --remaining || resolve(results);
        }, reject);
      });
      else resolve(results);
    });
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function(iterable){
    var Promise = getConstructor(this);
    return new Promise(function(resolve, reject){
      forOf(iterable, false, function(promise){
        Promise.resolve(promise).then(resolve, reject);
      });
    });
  }
});
cof.set(Promise, PROMISE);
require('./$.species')(Promise);
},{"./$":12,"./$.assert":4,"./$.cof":6,"./$.ctx":7,"./$.def":8,"./$.iter":11,"./$.species":18,"./$.task":20,"./$.uid":21,"./$.wks":22,"./es6.string.iterator":52,"./web.dom.iterable":63}],50:[function(require,module,exports){
var $         = require('./$')
  , $def      = require('./$.def')
  , setProto  = require('./$.set-proto')
  , $iter     = require('./$.iter')
  , ITER      = require('./$.uid').safe('iter')
  , step      = $iter.step
  , assert    = require('./$.assert')
  , isObject  = $.isObject
  , getDesc   = $.getDesc
  , setDesc   = $.setDesc
  , getProto  = $.getProto
  , apply     = Function.apply
  , assertObject = assert.obj
  , ownKeys   = require('./$.own-keys')
  , isExtensible = Object.isExtensible || $.it;
function Enumerate(iterated){
  var keys = [], key;
  for(key in iterated)keys.push(key);
  $.set(this, ITER, {o: iterated, a: keys, i: 0});
}
$iter.create(Enumerate, 'Object', function(){
  var iter = this[ITER]
    , keys = iter.a
    , key;
  do {
    if(iter.i >= keys.length)return step(1);
  } while(!((key = keys[iter.i++]) in iter.o));
  return step(0, key);
});

function wrap(fn){
  return function(it){
    assertObject(it);
    try {
      return fn.apply(undefined, arguments), true;
    } catch(e){
      return false;
    }
  }
}

function reflectGet(target, propertyKey/*, receiver*/){
  var receiver = arguments.length < 3 ? target : arguments[2]
    , desc = getDesc(assertObject(target), propertyKey), proto;
  if(desc)return $.has(desc, 'value')
    ? desc.value
    : desc.get === undefined
      ? undefined
      : desc.get.call(receiver);
  return isObject(proto = getProto(target))
    ? reflectGet(proto, propertyKey, receiver)
    : undefined;
}
function reflectSet(target, propertyKey, V/*, receiver*/){
  var receiver = arguments.length < 4 ? target : arguments[3]
    , ownDesc  = getDesc(assertObject(target), propertyKey)
    , existingDescriptor, proto;
  if(!ownDesc){
    if(isObject(proto = getProto(target))){
      return reflectSet(proto, propertyKey, V, receiver);
    }
    ownDesc = $.desc(0);
  }
  if($.has(ownDesc, 'value')){
    if(ownDesc.writable === false || !isObject(receiver))return false;
    existingDescriptor = getDesc(receiver, propertyKey) || $.desc(0);
    existingDescriptor.value = V;
    return setDesc(receiver, propertyKey, existingDescriptor), true;
  }
  return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
}

var reflect = {
  // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
  apply: require('./$.ctx')(Function.call, apply, 3),
  // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
  construct: function(target, argumentsList /*, newTarget*/){
    var proto    = assert.fn(arguments.length < 3 ? target : arguments[2]).prototype
      , instance = $.create(isObject(proto) ? proto : Object.prototype)
      , result   = apply.call(target, instance, argumentsList);
    return isObject(result) ? result : instance;
  },
  // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
  defineProperty: wrap(setDesc),
  // 26.1.4 Reflect.deleteProperty(target, propertyKey)
  deleteProperty: function(target, propertyKey){
    var desc = getDesc(assertObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  },
  // 26.1.5 Reflect.enumerate(target)
  enumerate: function(target){
    return new Enumerate(assertObject(target));
  },
  // 26.1.6 Reflect.get(target, propertyKey [, receiver])
  get: reflectGet,
  // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
  getOwnPropertyDescriptor: function(target, propertyKey){
    return getDesc(assertObject(target), propertyKey);
  },
  // 26.1.8 Reflect.getPrototypeOf(target)
  getPrototypeOf: function(target){
    return getProto(assertObject(target));
  },
  // 26.1.9 Reflect.has(target, propertyKey)
  has: function(target, propertyKey){
    return propertyKey in target;
  },
  // 26.1.10 Reflect.isExtensible(target)
  isExtensible: function(target){
    return !!isExtensible(assertObject(target));
  },
  // 26.1.11 Reflect.ownKeys(target)
  ownKeys: ownKeys,
  // 26.1.12 Reflect.preventExtensions(target)
  preventExtensions: wrap(Object.preventExtensions || $.it),
  // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
  set: reflectSet,
  // 26.1.14 Reflect.getOwnPropertyDescriptors(target)
  getOwnPropertyDescriptors: function(object){
    var O      = $.toObject(object)
        , result = {};
    $.each.call(ownKeys(O), function(key){
      $.setDesc(result, key, $.desc(0, $.getDesc(O, key)));
    });
    return result;
  }
}
// 26.1.14 Reflect.setPrototypeOf(target, proto)
if(setProto)reflect.setPrototypeOf = function(target, proto){
  return setProto(assertObject(target), proto), true;
}

$def($def.G, {Reflect: {}});
$def($def.S, 'Reflect', reflect);
},{"./$":12,"./$.assert":4,"./$.ctx":7,"./$.def":8,"./$.iter":11,"./$.own-keys":14,"./$.set-proto":17,"./$.uid":21}],51:[function(require,module,exports){
var $def    = require('./$.def')
  , toIndex = require('./$').toIndex
  , fromCharCode = String.fromCharCode;

$def($def.S, 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function(x){
    var res = []
      , len = arguments.length
      , i   = 0
      , code
    while(len > i){
      code = +arguments[i++];
      if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
      );
    } return res.join('');
  }
});
},{"./$":12,"./$.def":8}],52:[function(require,module,exports){
var set   = require('./$').set
  , at    = require('./$.string-at')(true)
  , ITER  = require('./$.uid').safe('iter')
  , $iter = require('./$.iter')
  , step  = $iter.step;

// 21.1.3.27 String.prototype[@@iterator]()
$iter.std(String, 'String', function(iterated){
  set(this, ITER, {o: String(iterated), i: 0});
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , index = iter.i
    , point;
  if(index >= O.length)return step(1);
  point = at.call(O, index);
  iter.i += point.length;
  return step(0, point);
});
},{"./$":12,"./$.iter":11,"./$.string-at":19,"./$.uid":21}],53:[function(require,module,exports){
'use strict';
var $        = require('./$')
  , cof      = require('./$.cof')
  , $def     = require('./$.def')
  , toLength = $.toLength
  , min      = Math.min
  , String   = $.g.String
  , assertDefined = $.assertDefined;
function assertNotRegExp(it){
  if(cof(it) == 'RegExp')throw TypeError();
}

$def($def.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: require('./$.string-at')(false),
  // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
  endsWith: function(searchString /*, endPosition = @length */){
    assertNotRegExp(searchString);
    var that = String(assertDefined(this))
      , endPosition = arguments[1]
      , len = toLength(that.length)
      , end = endPosition === undefined ? len : min(toLength(endPosition), len);
    searchString += '';
    return that.slice(end - searchString.length, end) === searchString;
  },
  // 21.1.3.7 String.prototype.includes(searchString, position = 0)
  includes: function(searchString /*, position = 0 */){
    assertNotRegExp(searchString);
    return !!~String(assertDefined(this)).indexOf(searchString, arguments[1]);
  },
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: function(count){
    var str = String(assertDefined(this))
      , res = ''
      , n   = $.toInteger(count);
    if(0 > n || n == Infinity)throw RangeError("Count can't be negative");
    for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
    return res;
  },
  // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
  startsWith: function(searchString /*, position = 0 */){
    assertNotRegExp(searchString);
    var that  = String(assertDefined(this))
      , index = toLength(min(arguments[1], that.length));
    searchString += '';
    return that.slice(index, index + searchString.length) === searchString;
  }
});
},{"./$":12,"./$.cof":6,"./$.def":8,"./$.string-at":19}],54:[function(require,module,exports){
var $    = require('./$')
  , $def = require('./$.def');

$def($def.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function(callSite){
    var raw = $.toObject(callSite.raw)
      , len = $.toLength(raw.length)
      , sln = arguments.length
      , res = []
      , i   = 0;
    while(len > i){
      res.push(String(raw[i++]));
      if(i < sln)res.push(String(arguments[i]));
    } return res.join('');
  }
});
},{"./$":12,"./$.def":8}],55:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var $        = require('./$')
  , setTag   = require('./$.cof').set
  , uid      = require('./$.uid')
  , $def     = require('./$.def')
  , has      = $.has
  , hide     = $.hide
  , getNames = $.getNames
  , toObject = $.toObject
  , Symbol   = $.g.Symbol
  , Base     = Symbol
  , setter   = true
  , TAG      = uid.safe('tag')
  , SymbolRegistry = {}
  , AllSymbols     = {};
// 19.4.1.1 Symbol([description])
if(!$.isFunction(Symbol)){
  Symbol = function(description){
    if(this instanceof Symbol)throw TypeError('Symbol is not a constructor');
    var tag = uid(description)
      , sym = AllSymbols[tag] = $.set($.create(Symbol.prototype), TAG, tag);
    $.DESC && setter && $.setDesc(Object.prototype, tag, {
      configurable: true,
      set: function(value){
        hide(this, tag, value);
      }
    });
    return sym;
  }
  hide(Symbol.prototype, 'toString', function(){
    return this[TAG];
  });
}
$def($def.G + $def.W, {Symbol: Symbol});

var symbolStatics = {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: require('./$.partial').call(require('./$.keyof'), SymbolRegistry, 0),
  pure: uid.safe,
  set: $.set,
  useSetter: function(){ setter = true },
  useSimple: function(){ setter = false }
};
// 19.4.2.2 Symbol.hasInstance
// 19.4.2.3 Symbol.isConcatSpreadable
// 19.4.2.4 Symbol.iterator
// 19.4.2.6 Symbol.match
// 19.4.2.8 Symbol.replace
// 19.4.2.9 Symbol.search
// 19.4.2.10 Symbol.species
// 19.4.2.11 Symbol.split
// 19.4.2.12 Symbol.toPrimitive
// 19.4.2.13 Symbol.toStringTag
// 19.4.2.14 Symbol.unscopables
$.each.call((
    // ES6:
    'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
    'species,split,toPrimitive,toStringTag,unscopables,' +
    // ES7 (in case, if ES7 modules required before):
    'referenceGet,referenceSet,referenceDelete'
  ).split(','), function(it){
    symbolStatics[it] = require('./$.wks')(it);
  }
);

$def($def.S, 'Symbol', symbolStatics);

$def($def.S + $def.F * (Symbol != Base), 'Object', {
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: function(it){
    var names = getNames(toObject(it)), result = [], key, i = 0;
    while(names.length > i)has(AllSymbols, key = names[i++]) || result.push(key);
    return result;
  },
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: function(it){
    var names = getNames(toObject(it)), result = [], key, i = 0;
    while(names.length > i)has(AllSymbols, key = names[i++]) && result.push(AllSymbols[key]);
    return result;
  }
});

setTag(Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setTag($.g.JSON, 'JSON', true);
},{"./$":12,"./$.cof":6,"./$.def":8,"./$.keyof":13,"./$.partial":15,"./$.uid":21,"./$.wks":22}],56:[function(require,module,exports){
require('./es6.collections');
// https://github.com/zenparsing/es-abstract-refs
var $                = require('./$')
  , wks              = require('./$.wks')
  , $def             = require('./$.def')
  , REFERENCE_GET    = wks('referenceGet')
  , REFERENCE_SET    = wks('referenceSet')
  , REFERENCE_DELETE = wks('referenceDelete')
  , hide             = $.hide;

$def($def.S, 'Symbol', {
  referenceGet:    REFERENCE_GET,
  referenceSet:    REFERENCE_SET,
  referenceDelete: REFERENCE_DELETE
});

hide(Function.prototype, REFERENCE_GET, $.that);

function setMapMethods(KEY){
  var Map = $.core[KEY] || $.g[KEY], MapProto;
  if(Map){
    MapProto = Map.prototype;
    hide(MapProto, REFERENCE_GET,    MapProto.get);
    hide(MapProto, REFERENCE_SET,    MapProto.set);
    hide(MapProto, REFERENCE_DELETE, MapProto['delete']);
  }
}
setMapMethods('Map');
setMapMethods('WeakMap');
},{"./$":12,"./$.def":8,"./$.wks":22,"./es6.collections":42}],57:[function(require,module,exports){
// https://github.com/domenic/Array.prototype.includes
var $def = require('./$.def');
$def($def.P, 'Array', {
  includes: require('./$.array-includes')(true)
});
},{"./$.array-includes":2,"./$.def":8}],58:[function(require,module,exports){
// https://gist.github.com/WebReflection/9353781
var $       = require('./$')
  , $def    = require('./$.def')
  , ownKeys = require('./$.own-keys');

$def($def.S, 'Object', {
  getOwnPropertyDescriptors: function(object){
    var O      = $.toObject(object)
      , result = {};
    $.each.call(ownKeys(O), function(key){
      $.setDesc(result, key, $.desc(0, $.getDesc(O, key)));
    });
    return result;
  }
});
},{"./$":12,"./$.def":8,"./$.own-keys":14}],59:[function(require,module,exports){
// https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-04/apr-9.md#51-objectentries-objectvalues
var $    = require('./$')
  , $def = require('./$.def');
function createObjectToArray(isEntries){
  return function(object){
    var O      = $.toObject(object)
      , keys   = $.getKeys(object)
      , length = keys.length
      , i      = 0
      , result = Array(length)
      , key;
    if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
    else while(length > i)result[i] = O[keys[i++]];
    return result;
  }
}
$def($def.S, 'Object', {
  values:  createObjectToArray(false),
  entries: createObjectToArray(true)
});
},{"./$":12,"./$.def":8}],60:[function(require,module,exports){
// https://gist.github.com/kangax/9698100
var $def = require('./$.def');
$def($def.S, 'RegExp', {
  escape: require('./$.replacer')(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
});
},{"./$.def":8,"./$.replacer":16}],61:[function(require,module,exports){
// https://github.com/mathiasbynens/String.prototype.at
var $def = require('./$.def');
$def($def.P, 'String', {
  at: require('./$.string-at')(true)
});
},{"./$.def":8,"./$.string-at":19}],62:[function(require,module,exports){
// JavaScript 1.6 / Strawman array statics shim
var $       = require('./$')
  , $def    = require('./$.def')
  , statics = {};
function setStatics(keys, length){
  $.each.call(keys.split(','), function(key){
    if(key in [])statics[key] = require('./$.ctx')(Function.call, [][key], length);
  });
}
setStatics('pop,reverse,shift,keys,values,entries', 1);
setStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
setStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
           'reduce,reduceRight,copyWithin,fill,turn');
$def($def.S, 'Array', statics);
},{"./$":12,"./$.ctx":7,"./$.def":8}],63:[function(require,module,exports){
require('./es6.array.iterator');
var $         = require('./$')
  , Iterators = require('./$.iter').Iterators
  , ITERATOR  = require('./$.wks')('iterator')
  , NodeList  = $.g.NodeList;
if($.FW && NodeList && !(ITERATOR in NodeList.prototype)){
  $.hide(NodeList.prototype, ITERATOR, Iterators.Array);
}
Iterators.NodeList = Iterators.Array;
},{"./$":12,"./$.iter":11,"./$.wks":22,"./es6.array.iterator":38}],64:[function(require,module,exports){
var $def  = require('./$.def')
  , $task = require('./$.task');
$def($def.G + $def.B, {
  setImmediate:   $task.set,
  clearImmediate: $task.clear
});
},{"./$.def":8,"./$.task":20}],65:[function(require,module,exports){
// ie9- setTimeout & setInterval additional parameters fix
var $       = require('./$')
  , $def    = require('./$.def')
  , invoke  = require('./$.invoke')
  , partial = require('./$.partial')
  , MSIE    = !!$.g.navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
function wrap(set){
  return MSIE ? function(fn, time /*, ...args */){
    return set(invoke(partial, [].slice.call(arguments, 2), $.isFunction(fn) ? fn : Function(fn)), time);
  } : set;
}
$def($def.G + $def.B + $def.F * MSIE, {
  setTimeout:  wrap(setTimeout),
  setInterval: wrap(setInterval)
});
},{"./$":12,"./$.def":8,"./$.invoke":10,"./$.partial":15}]},{},[1]);

// CommonJS export
if(typeof module != 'undefined' && module.exports)module.exports = __e;
// RequireJS export
else if(typeof define == 'function' && define.amd)define(function(){return __e});
// Export to global object
else __g.core = __e;
}();