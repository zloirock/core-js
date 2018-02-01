'use strict';
var anObject = require('core-js-internals/an-object');
var aFunction = require('core-js-internals/a-function');
var iterate = require('./_iterate');

// https://github.com/Ginden/collection-methods
require('./_export')({ target: 'Map', proto: true, real: true, forced: require('./_is-pure') }, {
  merge: function merge(iterable) {
    var map = anObject(this);
    iterate(iterable, true, aFunction(map.set), map);
    return map;
  }
});
