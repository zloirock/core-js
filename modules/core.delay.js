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