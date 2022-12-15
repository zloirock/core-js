'use strict';
var $ = require('../internals/export');
var bind = require('../internals/function-bind-context');
var SetHelpers = require('../internals/set-helpers');

var aSet = SetHelpers.aSet;
var iterate = SetHelpers.iterate;

// `Set.prototype.find` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Set', proto: true, real: true, forced: true }, {
  find: function find(callbackfn /* , thisArg */) {
    var set = aSet(this);
    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var result = iterate(set, function (value) {
      if (boundFunction(value, value, set)) return { value: value };
    }, true);
    return result && result.value;
  }
});
