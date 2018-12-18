'use strict';
var isDisjointOrSubset = require('../internals/set-is-disjoint-or-subset');

// `Set.prototype.isSubsetOf` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSubsetOf
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  isSubsetOf: function isSubsetOf(iterable) {
    return isDisjointOrSubset(this, iterable, false);
  }
});
