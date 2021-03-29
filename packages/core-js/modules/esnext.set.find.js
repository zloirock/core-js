'use strict';
var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var anObject = require('../internals/an-object');
var bind = require('../internals/function-bind-context');
var getSetIterator = require('../internals/get-set-iterator');
var iterate = require('../internals/iterate');

// `Set.prototype.find` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Set', proto: true, real: true, forced: IS_PURE }, {
  find: function find(callbackfn /* , thisArg */) {
    var set = anObject(this);
    var iterator = getSetIterator(set);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return iterate(iterator, function (value, stop) {
      if (boundFunction(value, value, set)) return stop(value);
    }, { IS_ITERATOR: true, INTERRUPTED: true }).result;
  },
});
