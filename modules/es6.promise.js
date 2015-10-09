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
  var P = require('/Users/ys/cradle/yaku/src/yaku');
  var toString = 'toString';
  var nativeCode = function () { return '[native code]'; }

  // TODO: use core-js [[toString]]
  // I haven't read much of the architecture of core-js, temporarily hard-coded it.
  P[toString] = nativeCode;
  P.prototype.then[toString] = nativeCode;
  P.prototype['catch'][toString] = nativeCode;
  P.resolve[toString] = nativeCode;
  P.reject[toString] = nativeCode;
  P.all[toString] = nativeCode;
  P.race[toString] = nativeCode;
  // TODO END

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
