'use strict';
var path = require('./_path');
var anObject = require('core-js-internals/an-object');
var bind = require('core-js-internals/bind-context');
var Set = path.Set;
var values = Set.prototype.values;

// https://github.com/Ginden/collection-methods
require('./_export')({ target: 'Set', proto: true, real: true, forced: require('./_is-pure') }, {
  every: function every(callbackfn /* , thisArg */) {
    var set = anObject(this);
    var iterator = values.call(set);
    var boundFn = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var step, value;
    while (!(step = iterator.next()).done) {
      if (!boundFn(value = step.value, value, set)) return false;
    } return true;
  }
});
