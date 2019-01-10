'use strict';
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');

// https://github.com/tc39/collection-methods
module.exports = function (/* ...elements */) {
  var collection = anObject(this);
  var remover = aFunction(collection['delete']);
  var allDeleted = true;
  for (var k = 0, len = arguments.length; k < len; k++) {
    allDeleted = allDeleted && remover.call(collection, arguments[k]);
  }
  return !!allDeleted;
};
