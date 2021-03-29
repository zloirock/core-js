'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.promise.constructor');
require('../../modules/es.promise.resolve');
var path = require('../../internals/path');

var Promise = path.Promise;
var $resolve = Promise.resolve;

module.exports = function resolve(x) {
  return $resolve.call(typeof this === 'function' ? this : Promise, x);
};
