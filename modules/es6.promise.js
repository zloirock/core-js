'use strict';
var $          = require('./$')
  , global     = require('./$.global')
  , classof    = require('./$.classof')
  , $def       = require('./$.def')
  , forOf      = require('./$.for-of')
  , setProto   = require('./$.set-proto').set
  , species    = require('./$.species')
  , asap       = require('./$.microtask')
  , PROMISE    = 'Promise'
  , process    = global.process
  , isNode     = classof(process) == 'process'
  , P          = global[PROMISE];

var testResolve = function(sub){
  var test = new P(function(){});
  if(sub)test.constructor = Object;
  return P.resolve(test) === test;
};

var useNative = function(){
  var works = false;
  function P2(x){
    var self = new P(x);
    setProto(self, P2.prototype);
    return self;
  }
  try {
    works = P && P.resolve && testResolve();
    setProto(P2, P);
    P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
    // actual Firefox has broken subclass support, test that
    if(!(P2.resolve(5).then(function(){}) instanceof P2)){
      works = false;
    }
    // actual V8 bug, https://code.google.com/p/v8/issues/detail?id=4162
    if(works && require('./$.support-desc')){
      var thenableThenGotten = false;
      P.resolve($.setDesc({}, 'then', {
        get: function(){ thenableThenGotten = true; }
      }));
      works = thenableThenGotten;
    }
  } catch(e){ works = false; }
  return works;
}();


// constructor polyfill
if(!useNative){
  var Yaku = require('yaku');
  // 25.4.3.1 Promise(executor)
  P = Yaku;

  // TODO: use core-js [[toString]]
  // I haven't read much of the architecture of core-js, temporarily hard-coded it.
  Yaku.toString = function () { return '[native code]'; };
  Yaku.prototype.then.toString = function () { return '[native code]'; };
  Yaku.prototype['catch'].toString = function () { return '[native code]'; };
  Yaku.resolve.toString = function () { return '[native code]'; };
  Yaku.reject.toString = function () { return '[native code]'; };
  Yaku.all.toString = function () { return '[native code]'; };
  Yaku.race.toString = function () { return '[native code]'; };
  // TODO END

  require('./$.mix')(P.prototype, Yaku.prototype);

  P.nextTick = asap;
  P.onUnhandledRejection = function (value, promise) {
    var handler, console;
    if(isNode){
      process.emit('unhandledRejection', value, promise);
    } else if(handler = global.onunhandledrejection){
      handler({promise: promise, reason: value});
    } else if((console = global.console) && console.error){
      console.error('Unhandled promise rejection', value);
    }
  };
}

// export
$def($def.G + $def.W + $def.F * !useNative, {Promise: P});
require('./$.tag')(P, PROMISE);
species(P);
species(require('./$.core')[PROMISE]);

// statics
$def($def.S + $def.F * !useNative, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: Yaku.reject
});
$def($def.S + $def.F * (!useNative || testResolve(true)), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: Yaku.resolve
});
$def($def.S + $def.F * !(useNative && require('./$.iter-detect')(function(iter){
  P.all(iter)['catch'](function(){});
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var values = [];
    return new P(function(res, rej){
      forOf(iterable, false, values.push, values);
      var remaining = values.length
        , results   = Array(remaining);
      if(remaining)$.each.call(values, function(promise, index){
        P.resolve(promise).then(function(value){
          results[index] = value;
          --remaining || res(results);
        }, rej);
      });
      else res(results);
    });
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    return new P(function(res, rej){
      forOf(iterable, false, function(promise){
        P.resolve(promise).then(res, rej);
      });
    });
  }
});