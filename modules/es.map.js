'use strict';
// 23.1 Map Objects
module.exports = require('./_collection')('Map', function (get) {
  return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, require('./_collection-strong'), true);
