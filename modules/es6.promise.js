'use strict';
var $          = require('./$')
  , global     = require('./$.global')
  , $def       = require('./$.def')
  , $mix       = require('./$.mix')
  , setProto   = require('./$.set-proto').set
  , species    = require('./$.species')
  , asap       = require('./$.microtask')
  , PROMISE    = 'Promise'
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

if(!useNative){
  P = require('yaku');
  require('yaku/lib/globalizeUnhandledRejection')();
  P.nextTick = asap;

  $mix(P, P);
  $mix(P.prototype, P.prototype);
}

// export
$def($def.G + $def.W + $def.F * !useNative, {Promise: P});
require('./$.tag')(P, PROMISE);
species(P);
species(require('./$.core')[PROMISE]);
