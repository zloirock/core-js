var $            = require('./$')
  , ctx          = require('./$.ctx')
  , call         = require('./$.iter-call')
  , assert       = require('./$.assert')
  , getIterFn    = require('./core.get-iter-fn')
  , isArrayIter  = require('./$.is-array-iter')
  , assertObject = assert.obj;
module.exports = function(iterable, entries, fn, that){
  var iterFn = getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator;
  assert($.isFunction(iterFn), iterable, ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = $.toLength(iterable.length); length > index; index++){
    entries ? f(assertObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    call(iterator, f, step.value, entries);
  }
};