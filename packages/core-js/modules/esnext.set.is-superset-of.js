'use strict';
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var iterate = require('../internals/iterate');
var BREAK = iterate.BREAK;

// `Set.prototype.isSupersetOf` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSupersetOf
require('../internals/export')({ target: 'Set', proto: true, real: true, forced: require('../internals/is-pure') }, {
  isSupersetOf: function isSupersetOf(iterable) {
    var set = anObject(this);
    var hasCheck = aFunction(set.has);
    return iterate(iterable, function (value) {
      if (hasCheck.call(set, value) === false) return BREAK;
    }) !== BREAK;
  }
});
