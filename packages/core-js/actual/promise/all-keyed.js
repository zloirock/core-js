'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.promise.constructor');
require('../../modules/es.promise.catch');
require('../../modules/es.promise.finally');
require('../../modules/es.promise.resolve');
require('../../modules/es.reflect.own-keys');
require('../../modules/esnext.promise.all-keyed');
var call = require('../../internals/function-call');
var isCallable = require('../../internals/is-callable');
var path = require('../../internals/path');

var Promise = path.Promise;
var $allKeyed = Promise.allKeyed;

module.exports = function allKeyed(promises) {
  return call($allKeyed, isCallable(this) ? this : Promise, promises);
};
