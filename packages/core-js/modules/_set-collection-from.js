'use strict';
// https://tc39.github.io/proposal-setmap-offrom/
var $export = require('./_export');
var aFunction = require('core-js-internals/a-function');
var bind = require('core-js-internals/bind-context');
var iterate = require('./_iterate');

module.exports = function (COLLECTION) {
  $export({ target: COLLECTION, stat: true }, { from: function from(source /* , mapFn, thisArg */) {
    var mapFn = arguments[1];
    var mapping, A, n, boundFunction;
    aFunction(this);
    mapping = mapFn !== undefined;
    if (mapping) aFunction(mapFn);
    if (source == undefined) return new this();
    A = [];
    if (mapping) {
      n = 0;
      boundFunction = bind(mapFn, arguments[2], 2);
      iterate(source, false, function (nextItem) {
        A.push(boundFunction(nextItem, n++));
      });
    } else {
      iterate(source, false, A.push, A);
    }
    return new this(A);
  } });
};
