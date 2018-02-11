'use strict';
var path = require('../internals/path');
var anObject = require('core-js-internals/an-object');
var bind = require('core-js-internals/bind-context');
var Set = path.Set;
var values = Set.prototype.values;

// https://github.com/tc39/collection-methods
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  find: function find(callbackfn /* , thisArg */) {
    var set = anObject(this);
    var iterator = values.call(set);
    var boundFn = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var step, value;
    while (!(step = iterator.next()).done) {
      if (boundFn(value = step.value, value, set)) return value;
    }
  }
});
