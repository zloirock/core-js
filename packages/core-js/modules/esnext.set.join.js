'use strict';
var path = require('./_path');
var anObject = require('core-js-internals/an-object');
var Set = path.Set;
var values = Set.prototype.values;

// https://github.com/Ginden/collection-methods
require('./_export')({ target: 'Set', proto: true, real: true, forced: require('./_is-pure') }, {
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
