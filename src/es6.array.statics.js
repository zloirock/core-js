require('./es6.iterators');
var $    = require('./$')
  , $def = require('./$.def')
  , Iter = require('./$.iter');
function generic(A, B){
  // strange IE quirks mode bug -> use typeof instead of isFunction
  return typeof A == 'function' ? A : B;
}
$def($def.S + $def.F * Iter.DANGER_CLOSING, 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = Object($.assert.def(arrayLike))
      , mapfn   = arguments[1]
      , mapping = mapfn !== undefined
      , f       = mapping ? $.ctx(mapfn, arguments[2], 2) : undefined
      , index   = 0
      , length, result, step;
    if(Iter.is(O)){
      result = new (generic(this, Array));
      Iter.exec(function(iterator){
        for(; !(step = iterator.next()).done; index++){
          result[index] = mapping ? f(step.value, index) : step.value;
        }
      }, Iter.get(O));
    } else {
      result = new (generic(this, Array))(length = $.toLength(O.length));
      for(; length > index; index++){
        result[index] = mapping ? f(O[index], index) : O[index];
      }
    }
    result.length = index;
    return result;
  }
});

$def($def.S, 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function(/* ...args */){
    var index  = 0
      , length = arguments.length
      , result = new (generic(this, Array))(length);
    while(length > index)result[index] = arguments[index++];
    result.length = length;
    return result;
  }
});

require('./$.species')(Array);