'use strict';
// https://tc39.github.io/proposal-setmap-offrom/
var $export = require('../internals/export');

module.exports = function (COLLECTION) {
  $export({ target: COLLECTION, stat: true }, { of: function of() {
    var length = arguments.length;
    var A = new Array(length);
    while (length--) A[length] = arguments[length];
    return new this(A);
  } });
};
