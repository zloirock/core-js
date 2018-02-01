'use strict';
var iterate = require('./_iterate');

// https://github.com/tc39/collection-methods
require('./_export')({ target: 'Map', stat: true, forced: require('./_is-pure') }, {
  keyBy: function keyBy(iterable, keyDerivative) {
    var newMap = new this();
    iterate(iterable, false, function (element) {
      newMap.set(keyDerivative(element), element);
    });
    return newMap;
  }
});
