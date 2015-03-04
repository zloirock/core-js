require('./es6.promise');
var $ = require('./$');
var $def = require('./$.def');
var partial = require('./$.partial');
// https://esdiscuss.org/topic/promise-returning-delay-function
$def($def.G + $def.F, {
  delay: function(time){
    return new $.core.Promise(function(resolve){
      setTimeout(partial.call(resolve, true), time);
    });
  }
});