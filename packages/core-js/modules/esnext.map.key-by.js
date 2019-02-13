'use strict';
var iterate = require('../internals/iterate');
var aFunction = require('../internals/a-function');

// `Map.keyBy` method
// https://github.com/tc39/proposal-collection-methods
require('../internals/export')({ target: 'Map', stat: true, forced: require('../internals/is-pure') }, {
  keyBy: function keyBy(iterable, keyDerivative) {
    var newMap = new this();
    aFunction(keyDerivative);
    var setter = aFunction(newMap.set);
    iterate(iterable, function (element) {
      setter.call(newMap, keyDerivative(element), element);
    });
    return newMap;
  }
});
