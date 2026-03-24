'use strict';
var SetHelpers = require('../internals/set-helpers');

var Set = SetHelpers.Set;
var add = SetHelpers.add;
var forEach = SetHelpers.forEach;

module.exports = function (set) {
  var result = new Set();
  forEach(set, function (it) {
    add(result, it);
  });
  return result;
};
