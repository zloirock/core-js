var $          = require('./$')
  , anObject   = require('./$.an-object')
  , isFunction = require('./$.is-function')
  , get        = require('./core.get-iterator-method');
module.exports = $.core.getIterator = function(it){
  var iterFn = get(it);
  if(!isFunction(iterFn))throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};