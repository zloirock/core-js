'use strict';
var anObject = require('../internals/an-object');
var getSetIterator = require('../internals/get-set-iterator');

// `Set.prototype.join` method
// https://github.com/tc39/collection-methods
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  join: function join(separator) {
    var set = anObject(this);
    var iterator = getSetIterator(set);
    var sep = separator === undefined ? ',' : String(separator);
    var result = [];
    var step;
    while (!(step = iterator.next()).done) result.push(step.value);
    return result.join(sep);
  }
});
