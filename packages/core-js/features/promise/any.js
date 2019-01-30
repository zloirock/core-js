'use strict';
require('../../modules/es.promise');
require('../../modules/esnext.promise.any');
var Promise = require('../../internals/path').Promise;
var $any = Promise.any;

module.exports = function any(iterable) {
  return $any.call(typeof this === 'function' ? this : Promise, iterable);
};
