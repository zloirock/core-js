'use strict';
var global             = require('./_global')
  , $export            = require('./_export')
  , redefine           = require('./_redefine')
  , wks                = require('./_wks')
  , PROMISE            = 'Promise'
  , $Promise           = global[PROMISE]
  , empty              = function(){ /* empty */ }
  , Yaku               = require('./yaku');

var USE_NATIVE = !!function(){
  try {
    // correct subclassing with @@species support
    var promise     = $Promise.resolve(1)
      , FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function(exec){ exec(empty, empty); };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
  } catch(e){ /* empty */ }
}();

// constructor polyfill
if(!USE_NATIVE){

  // Promise need two well-known symbols.
  Yaku.Symbol = {
    iterator: wks('iterator'),
    species: wks('species'),
  };

  // Use the special optimized microtask.
  Yaku.nextTick = require('./_microtask');

  // For subclass construction.
  Yaku.speciesConstructor = require('./_species-constructor');

  $Promise = Yaku;

  var redefineAll = function (target) {
    var k;
    for (k in target) {
      var v = target[k];
      delete target[k];
      redefine(target, k, v);
    }
  }

  redefineAll($Promise);
  redefineAll($Promise.prototype);
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
