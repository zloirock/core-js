'use strict';
// 23.2 Set Objects
module.exports = require('./_collection')('Set', function (get) {
  return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, require('./_collection-strong'));
