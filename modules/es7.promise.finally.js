'use strict';
// https://github.com/tc39/proposal-promise-finally
var $export = require('./_export')
  , core = require('./_core')
  , global = require('./_global')
  , speciesConstructor = require('./_species-constructor')
  , $Promise = core.Promise || global.Promise;

$export($export.P, 'Promise', {
  'finally': function(onFinally){
    var handler = typeof onFinally === 'function' ? onFinally : function(){};
    var C = speciesConstructor(this, $Promise);
    var newPromise = $Promise.prototype.then.call(
      this, // throw if IsPromise(this) is not true
      function(x) {
        return new C(function(resolve) {
          return resolve(handler());
        })
        .then(function(){ return x })
      },
      function(e) {
        return new C(function(resolve) {
          return resolve(handler());
        })
        .then(function(){ throw e; });
      }
    );
    return newPromise;
  }
});
