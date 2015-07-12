var $                 = require('./$')
  , global            = $.g
  , cof               = require('./$.cof')
  , classof           = cof.classof
  , SYMBOL_ITERATOR   = require('./$.wks')('iterator')
  , Iterators         = {}
  , IteratorPrototype = {};
function get(it){
  var Symbol = global.Symbol;
  if(it != undefined){
    return it[Symbol && Symbol.iterator || '@@iterator']
      || it[SYMBOL_ITERATOR]
      || Iterators[classof(it)];
  }
}
function create(Constructor, NAME, next){
  Constructor.prototype = $.create(IteratorPrototype, {next: $.desc(1, next)});
  cof.set(Constructor, NAME + ' Iterator');
}
function step(done, value){
  return {value: value, done: !!done};
}
function isArrayIter(it){
  return ('Array' in Iterators ? Iterators.Array : Array.prototype[SYMBOL_ITERATOR]) === it;
}
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
$.hide(IteratorPrototype, SYMBOL_ITERATOR, $.that);

module.exports = {
  // Safari has buggy iterators w/o `next`
  BUGGY: 'keys' in [] && !('next' in [].keys()),
  Iterators: Iterators,
  step: step,
  get: get,
  create: create,
  isArrayIter: isArrayIter
};