'use strict';
var anObject = require('core-js-internals/an-object');
var aFunction = require('core-js-internals/a-function');

// https://github.com/tc39/collection-methods
require('./_export')({ target: 'Set', proto: true, real: true, forced: require('./_is-pure') }, {
  addAll: function addAll(/* ...elements */) {
    var set = anObject(this);
    var adder = aFunction(set.add);
    for (var k = 0, len = arguments.length; k < len; k++) {
      adder.call(set, arguments[k]);
    }
    return set;
  }
});
