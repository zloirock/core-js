'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.promise.constructor');
require('../../modules/es.promise.catch');
require('../../modules/es.promise.finally');
require('../../modules/es.promise.with-resolvers');
var call = require('../../internals/function-call');
var isCallable = require('../../internals/is-callable');
var path = require('../../internals/path');

var Promise = path.Promise;
var promiseWithResolvers = Promise.withResolvers;

module.exports = function withResolvers() {
  return call(promiseWithResolvers, isCallable(this) ? this : Promise);
};
