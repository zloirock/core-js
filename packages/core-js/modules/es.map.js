'use strict';
// `Map` constructor
// https://tc39.github.io/ecma262/#sec-map-objects
module.exports = require('./_collection')('Map', function (get) {
  return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, require('./_collection-strong'), true);
