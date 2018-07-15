'use strict';
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');

// https://github.com/tc39/collection-methods
module.exports = function (/* ...elements */) {
  var set = anObject(this);
  var remover = aFunction(set['delete']);
  var result = true;
  for (var k = 0, len = arguments.length; k < len; k++) {
    if (!remover.call(set, arguments[k])) result = false;
  }
  return result;
};
