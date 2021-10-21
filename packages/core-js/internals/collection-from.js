'use strict';
// https://tc39.github.io/proposal-setmap-offrom/
var uncurryThis = require('../internals/function-uncurry-this');
var aCallable = require('../internals/a-callable');
var aConstructor = require('../internals/a-constructor');
var bind = require('../internals/function-bind-context');
var iterate = require('../internals/iterate');

var push = uncurryThis([].push);

module.exports = function from(source /* , mapFn, thisArg */) {
  var length = arguments.length;
  var mapFn = length > 1 ? arguments[1] : undefined;
  var mapping, array, n, boundFunction;
  aConstructor(this);
  mapping = mapFn !== undefined;
  if (mapping) aCallable(mapFn);
  if (source == undefined) return new this();
  array = [];
  if (mapping) {
    n = 0;
    boundFunction = bind(mapFn, length > 2 ? arguments[2] : undefined);
    iterate(source, function (nextItem) {
      push(array, boundFunction(nextItem, n++));
    });
  } else {
    iterate(source, array.push, { that: array });
  }
  return new this(array);
};
