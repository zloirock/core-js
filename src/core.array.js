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