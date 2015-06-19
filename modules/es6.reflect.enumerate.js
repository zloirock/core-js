// 26.1.5 Reflect.enumerate(target)
var $              = require('./$')
  , $def           = require('./$.def')
  , $iter          = require('./$.iter')
  , ITERATOR       = require('./$.wks')('iterator')
  , ITER           = require('./$.uid').safe('iter')
  , step           = $iter.step
  , $Reflect       = $.g.Reflect
  , assertObject   = require('./$.assert').obj
  // IE TP has broken Reflect.enumerate
  , buggyEnumerate = !($Reflect && $Reflect.enumerate && ITERATOR in $Reflect.enumerate({}));

function Enumerate(iterated){
  $.set(this, ITER, {o: iterated, k: undefined, i: 0});
}
$iter.create(Enumerate, 'Object', function(){
  var iter = this[ITER]
    , keys = iter.k
    , key;
  if(keys == undefined){
    iter.k = keys = [];
    for(key in iter.o)keys.push(key);
  }
  do {
    if(iter.i >= keys.length)return step(1);
  } while(!((key = keys[iter.i++]) in iter.o));
  return step(0, key);
});

$def($def.S + $def.F * buggyEnumerate, 'Reflect', {
  enumerate: function enumerate(target){
    return new Enumerate(assertObject(target));
  }
});