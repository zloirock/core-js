'use strict';
var iterateSimple = require('../internals/iterate-simple');

module.exports = function (set, fn) {
  return iterateSimple(set.keys(), fn, true);
};
