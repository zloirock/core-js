'use strict';
var isObject = require('../internals/is-object');

var $TypeError = TypeError;

module.exports = function (options) {
  var padding = options && options.padding;
  if (padding === undefined || isObject(padding)) return padding;
  throw new $TypeError('Incorrect `padding` option');
};
