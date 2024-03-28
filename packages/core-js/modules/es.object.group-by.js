'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var aCallable = require('../internals/a-callable');
var requireObjectCoercible = require('../internals/require-object-coercible');
var toPropertyKey = require('../internals/to-property-key');
var iterate = require('../internals/iterate');

var create = Object.create;
var push = uncurryThis([].push);

// `Object.groupBy` method
// https://github.com/tc39/proposal-array-grouping
$({ target: 'Object', stat: true }, {
  groupBy: function groupBy(items, callbackfn) {
    requireObjectCoercible(items);
    aCallable(callbackfn);
    var obj = create(null);
    var k = 0;
    // dependency: es.array.iterator
    // dependency: es.string.iterator
    // dependency: web.dom-collections.iterator
    iterate(items, function (value) {
      var key = toPropertyKey(callbackfn(value, k++));
      // in some IE versions, `hasOwnProperty` returns incorrect result on integer keys
      // but since it's a `null` prototype object, we can safely use `in`
      if (key in obj) push(obj[key], value);
      else obj[key] = [value];
    });
    return obj;
  },
});
