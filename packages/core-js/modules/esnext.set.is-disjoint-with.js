'use strict';
var isDisjointOrSubset = require('../internals/set-is-disjoint-or-subset');

// `Set.prototype.isDisjointWith` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isDisjointWith
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  isDisjointWith: function isDisjointWith(iterable) {
    return isDisjointOrSubset(this, iterable, true);
  }
});
