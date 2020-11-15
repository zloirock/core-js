'use strict';
var $ = require('../internals/export');
var requireObjectCoercible = require('../internals/require-object-coercible');
var toLength = require('../internals/to-length');
var toInteger = require('../internals/to-integer');

// `String.prototype.item` method
// https://github.com/tc39/proposal-item-method
$({ target: 'String', proto: true }, {
  item: function item(index) {
    var S = String(requireObjectCoercible(this));
    var len = toLength(S.length);
    var relativeIndex = toInteger(index);
    var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
    return (k < 0 || k >= len) ? undefined : S.charAt(k);
  }
});
