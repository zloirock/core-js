'use strict';
var iterate = require('../internals/iterate');

// https://github.com/tc39/collection-methods
require('../internals/export')({ target: 'Map', stat: true, forced: require('../internals/is-pure') }, {
  keyBy: function keyBy(iterable, keyDerivative) {
    var newMap = new this();
    iterate(iterable, false, function (element) {
      newMap.set(keyDerivative(element), element);
    });
    return newMap;
  }
});
