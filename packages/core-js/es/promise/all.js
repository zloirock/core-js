'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.promise.constructor');
require('../../modules/es.promise.all');
require('../../modules/es.promise.resolve');
require('../../modules/es.string.iterator');
require('../../modules/web.dom-collections.iterator');
var path = require('../../internals/path');

var Promise = path.Promise;
var $all = Promise.all;

module.exports = function all(iterable) {
  return $all.call(typeof this === 'function' ? this : Promise, iterable);
};
