'use strict';
var $ = require('../internals/export');
var WeakSetHelpers = require('../internals/weak-set-helpers');

var aWeakSet = WeakSetHelpers.aWeakSet;
var add = WeakSetHelpers.add;

// `WeakSet.prototype.addAll` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'WeakSet', proto: true, real: true, forced: true }, {
  addAll: function addAll(/* ...elements */) {
    var set = aWeakSet(this);
    for (var k = 0, len = arguments.length; k < len; k++) {
      add(set, arguments[k]);
    } return set;
  }
});
