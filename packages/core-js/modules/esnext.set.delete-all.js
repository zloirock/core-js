'use strict';
var anObject = require('core-js-internals/an-object');
var aFunction = require('core-js-internals/a-function');

// https://github.com/Ginden/collection-methods
require('./_export')({ target: 'Set', proto: true, real: true, forced: require('./_is-pure') }, {
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
