var $       = require('./$')
  , $iter   = require('./$.iter')
  , assert  = require('./$.assert')
  , global  = $.g
  , core    = $.core
  , classof = require('./$.cof').classof
  , SYMBOL_ITERATOR = require('./$.wks')('iterator');
core.isIterable = function(it){
  var O      = Object(it)
    , Symbol = global.Symbol;
  return (Symbol && Symbol.iterator || '@@iterator') in O
    || SYMBOL_ITERATOR in O
    || $.has($iter.Iterators, classof(O));
};
core.getIterator = function(it){
  var iterFn = $iter.get(it);
  assert($.isFunction(iterFn), it, ' is not iterable!');
  return assert.obj(iterFn.call(it));
};