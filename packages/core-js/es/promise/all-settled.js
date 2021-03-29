'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.promise.constructor');
require('../../modules/es.promise.all-settled');
require('../../modules/es.promise.resolve');
require('../../modules/es.string.iterator');
require('../../modules/web.dom-collections.iterator');
var path = require('../../internals/path');

var Promise = path.Promise;
var $allSettled = Promise.allSettled;

module.exports = function allSettled(iterable) {
  return $allSettled.call(typeof this === 'function' ? this : Promise, iterable);
};
