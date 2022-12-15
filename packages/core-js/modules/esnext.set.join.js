'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var toString = require('../internals/to-string');
var SetHelpers = require('../internals/set-helpers');

var aSet = SetHelpers.aSet;
var iterate = SetHelpers.iterate;
var arrayJoin = uncurryThis([].join);
var push = uncurryThis([].push);

// `Set.prototype.join` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Set', proto: true, real: true, forced: true }, {
  join: function join(separator) {
    var set = aSet(this);
    var sep = separator === undefined ? ',' : toString(separator);
    var array = [];
    iterate(set, function (value) {
      push(array, value);
    });
    return arrayJoin(array, sep);
  }
});
