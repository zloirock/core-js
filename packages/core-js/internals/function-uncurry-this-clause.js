'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

module.exports = function (fn) {
  if (typeof fn == 'function') return uncurryThis(fn);
};
