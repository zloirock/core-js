'use strict';
var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var aCallable = require('../internals/a-callable');
var anObject = require('../internals/an-object');
var iterate = require('../internals/iterate');

// `Set.prototype.isSupersetOf` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSupersetOf
$({ target: 'Set', proto: true, real: true, forced: IS_PURE }, {
  isSupersetOf: function isSupersetOf(iterable) {
    var set = anObject(this);
    var hasCheck = aCallable(set.has);
    return !iterate(iterable, function (value, stop) {
      if (hasCheck.call(set, value) === false) return stop();
    }, { INTERRUPTED: true }).stopped;
  }
});
