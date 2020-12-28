'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.promise.constructor');
require('../../modules/es.promise.reject');
var path = require('../../internals/path');

var Promise = path.Promise;
var $reject = Promise.reject;

module.exports = function reject(r) {
  return $reject.call(typeof this === 'function' ? this : Promise, r);
};
