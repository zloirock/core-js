'use strict';
var $ = require('../internals/export');
var aFunction = require('../internals/a-function');
var getIterator = require('../internals/get-iterator');
var iterate = require('../internals/iterate');

// `Map.groupBy` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', stat: true }, {
  groupBy: function groupBy(iterable, keyDerivative) {
    aFunction(keyDerivative);
    var iterator = getIterator(iterable);
    var newMap = new this();
    var has = aFunction(newMap.has);
    var get = aFunction(newMap.get);
    var set = aFunction(newMap.set);
    iterate(iterator, function (element) {
      var derivedKey = keyDerivative(element);
      if (!has.call(newMap, derivedKey)) set.call(newMap, derivedKey, [element]);
      else get.call(newMap, derivedKey).push(element);
    }, { IS_ITERATOR: true });
    return newMap;
  }
});
