'use strict';
var iterate = require('./_iterate');

// https://github.com/tc39/collection-methods
require('./_export')({ target: 'Map', stat: true, forced: require('./_is-pure') }, {
  groupBy: function groupBy(iterable, keyDerivative) {
    var newMap = new this();
    iterate(iterable, false, function (element) {
      var derivedKey = keyDerivative(element);
      if (!newMap.has(derivedKey)) newMap.set(derivedKey, [element]);
      else newMap.get(derivedKey).push(element);
    });
    return newMap;
  }
});
