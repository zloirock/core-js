'use strict';
require('../../modules/es.object.create');
require('../../modules/es.object.to-string');
require('../../modules/es.promise');
require('../../modules/es.reflect.own-keys');
require('../../modules/esnext.promise.all-settled-keyed');
var call = require('../../internals/function-call');
var isCallable = require('../../internals/is-callable');
var path = require('../../internals/path');

var Promise = path.Promise;
var $allSettledKeyed = Promise.allSettledKeyed;

module.exports = function allSettledKeyed(promises) {
  return call($allSettledKeyed, isCallable(this) ? this : Promise, promises);
};
