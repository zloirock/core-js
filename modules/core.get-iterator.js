var $        = require('./$')
  , get      = require('./core.get-iter-fn')
  , anObject = require('./$.an-object');
module.exports = $.core.getIterator = function(it){
  var iterFn = get(it);
  if(!$.isFunction(iterFn))throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};