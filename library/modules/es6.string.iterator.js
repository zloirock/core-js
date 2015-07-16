var set  = require('./$').set
  , $at  = require('./$.string-at')(true)
  , ITER = require('./$.uid').safe('iter');

// 21.1.3.27 String.prototype[@@iterator]()
require('./$.iter-define')(String, 'String', function(iterated){
  set(this, ITER, {o: String(iterated), i: 0});
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , index = iter.i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  iter.i += point.length;
  return {value: point, done: false};
});