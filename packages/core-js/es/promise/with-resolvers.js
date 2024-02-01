'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.promise.constructor');
require('../../modules/es.promise.catch');
require('../../modules/es.promise.finally');
require('../../modules/es.promise.with-resolvers');

var getBuiltIn = require('../../internals/get-built-in');
var getBuiltInStaticMethod = require('../../internals/get-built-in-static-method');
var isCallable = require('../../internals/is-callable');
var apply = require('../../internals/function-apply');

var method = getBuiltInStaticMethod('Promise', 'withResolvers');

module.exports = function withResolvers() {
  return apply(method, isCallable(this) ? this : getBuiltIn('Promise'), arguments);
};
