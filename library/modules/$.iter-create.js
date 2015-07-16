var $ = require('./$')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
$.hide(IteratorPrototype, require('./$.wks')('iterator'), $.that);

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = $.create(IteratorPrototype, {next: $.desc(1, next)});
  require('./$.cof').set(Constructor, NAME + ' Iterator');
};