var ctx   = require('./$.ctx')
  , $iter = require('./$.iter')
  , stepCall = $iter.stepCall;
module.exports = function(iterable, entries, fn, that){
  var iterator = $iter.get(iterable)
    , f = ctx(fn, that, entries ? 2 : 1)
    , step;
  while(!(step = iterator.next()).done){
    if(stepCall(iterator, f, step.value, entries) === false){
      return $iter.close(iterator);
    }
  }
};