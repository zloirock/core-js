require('./es6.promise');
var Promise = require('./$').core.Promise
  , $def    = require('./$.def')
  , partial = require('./$.partial');
// https://esdiscuss.org/topic/promise-returning-delay-function
$def($def.G + $def.F, {
  delay: function(time){
    return new Promise(function(resolve){
      setTimeout(partial.call(resolve, true), time);
    });
  }
});