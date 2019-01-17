'use strict';
// https://tc39.github.io/proposal-setmap-offrom/
var aFunction = require('../internals/a-function');
var bind = require('../internals/bind-context');
var iterate = require('../internals/iterate');

module.exports = function from(source /* , mapFn, thisArg */) {
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
    iterate(source, function (nextItem) {
      A.push(boundFunction(nextItem, n++));
    });
  } else {
    iterate(source, A.push, A);
  }
  return new this(A);
};
