'use strict';
// `Set` constructor
// https://tc39.github.io/ecma262/#sec-set-objects
module.exports = require('./_collection')('Set', function (get) {
  return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, require('./_collection-strong'));
