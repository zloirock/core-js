'use strict';
var anObject = require('core-js-internals/an-object');
var aFunction = require('core-js-internals/a-function');

// https://github.com/tc39/collection-methods
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  deleteAll: function deleteAll(/* ...elements */) {
    var set = anObject(this);
    var remover = aFunction(set['delete']);
    var result = true;
    for (var k = 0, len = arguments.length; k < len; k++) {
      if (!remover.call(set, arguments[k])) result = false;
    }
    return result;
  }
});
