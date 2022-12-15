'use strict';
var $ = require('../internals/export');
var SetHelpers = require('../internals/set-helpers');

var aSet = SetHelpers.aSet;
var add = SetHelpers.add;

// `Set.prototype.addAll` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Set', proto: true, real: true, forced: true }, {
  addAll: function addAll(/* ...elements */) {
    var set = aSet(this);
    for (var k = 0, len = arguments.length; k < len; k++) {
      add(set, arguments[k]);
    } return set;
  }
});
