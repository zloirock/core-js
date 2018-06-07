'use strict';
var iterate = require('../internals/iterate');

// `Map.groupBy` method
// https://github.com/tc39/collection-methods
require('../internals/export')({ target: 'Map', stat: true, forced: require('../internals/is-pure') }, {
  groupBy: function groupBy(iterable, keyDerivative) {
    var newMap = new this();
    iterate(iterable, function (element) {
      var derivedKey = keyDerivative(element);
      if (!newMap.has(derivedKey)) newMap.set(derivedKey, [element]);
      else newMap.get(derivedKey).push(element);
    });
    return newMap;
  }
});
