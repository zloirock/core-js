'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.aggregate-error.constructor');
require('../../modules/es.promise.constructor');
require('../../modules/es.promise.any');
require('../../modules/es.promise.resolve');
require('../../modules/es.string.iterator');
require('../../modules/web.dom-collections.iterator');
var path = require('../../internals/path');

var Promise = path.Promise;
var $any = Promise.any;

module.exports = function any(iterable) {
  return $any.call(typeof this === 'function' ? this : Promise, iterable);
};
