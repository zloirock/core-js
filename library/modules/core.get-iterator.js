var $      = require('./$')
  , get    = require('./$.iter').get
  , assert = require('./$.assert');
module.exports = $.core.getIterator = function(it){
  var iterFn = get(it);
  assert($.isFunction(iterFn), it, ' is not iterable!');
  return assert.obj(iterFn.call(it));
};