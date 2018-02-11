'use strict';
var path = require('../internals/path');
var anObject = require('core-js-internals/an-object');
var Set = path.Set;
var values = Set.prototype.values;

// https://github.com/tc39/collection-methods
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  join: function join(separator) {
    var set = anObject(this);
    var iterator = values.call(set);
    var sep = separator === undefined ? ',' : String(separator);
    var result = [];
    var step;
    while (!(step = iterator.next()).done) result.push(step.value);
    return result.join(sep);
  }
});
