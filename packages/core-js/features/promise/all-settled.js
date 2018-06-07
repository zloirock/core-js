'use strict';
require('../../modules/es.promise');
require('../../modules/esnext.promise.all-settled');
var Promise = require('../../internals/path').Promise;
var $allSettled = Promise.allSettled;

module.exports = function allSettled(iterable) {
  return $allSettled.call(typeof this === 'function' ? this : Promise, iterable);
};
