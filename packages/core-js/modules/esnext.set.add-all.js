'use strict';
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');

// https://github.com/tc39/collection-methods
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  addAll: function addAll(/* ...elements */) {
    var set = anObject(this);
    var adder = aFunction(set.add);
    for (var k = 0, len = arguments.length; k < len; k++) {
      adder.call(set, arguments[k]);
    }
    return set;
  }
});
