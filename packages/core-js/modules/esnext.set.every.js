'use strict';
var anObject = require('../internals/an-object');
var bind = require('../internals/bind-context');
var getSetIterator = require('../internals/get-set-iterator');

// `Set.prototype.every` method
// https://github.com/tc39/collection-methods
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  every: function every(callbackfn /* , thisArg */) {
    var set = anObject(this);
    var iterator = getSetIterator(set);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var step, value;
    while (!(step = iterator.next()).done) {
      if (!boundFunction(value = step.value, value, set)) return false;
    } return true;
  }
});
