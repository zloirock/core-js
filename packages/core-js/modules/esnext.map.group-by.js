'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var uncurryThis = require('../internals/function-uncurry-this');
var isCallable = require('../internals/is-callable');
var aCallable = require('../internals/a-callable');
var iterate = require('../internals/iterate');
var Map = require('../internals/map-helpers').Map;

var push = uncurryThis([].push);

// `Map.groupBy` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', stat: true, forced: true }, {
  groupBy: function groupBy(iterable, keyDerivative) {
    var C = isCallable(this) ? this : Map;
    var newMap = new C();
    aCallable(keyDerivative);
    var has = aCallable(newMap.has);
    var get = aCallable(newMap.get);
    var set = aCallable(newMap.set);
    iterate(iterable, function (element) {
      var derivedKey = keyDerivative(element);
      if (!call(has, newMap, derivedKey)) call(set, newMap, derivedKey, [element]);
      else push(call(get, newMap, derivedKey), element);
    });
    return newMap;
  }
});
