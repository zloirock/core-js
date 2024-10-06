'use strict';
require('../../modules/es.promise');
require('../../modules/esnext.promise.try');
var apply = require('../../internals/function-apply');
var isCallable = require('../../internals/is-callable');
var path = require('../../internals/path');

var Promise = path.Promise;
var promiseTry = Promise['try'];

// eslint-disable-next-line no-unused-vars -- required for arity
module.exports = ({ 'try': function (callbackfn /* , ...args */) {
  return apply(promiseTry, isCallable(this) ? this : Promise, arguments);
} })['try'];
