'use strict';
require('../../modules/es.promise');
require('../../modules/esnext.promise.try');
var uncurryThis = require('../../internals/function-uncurry-this');
var isCallable = require('../../internals/is-callable');
var path = require('../../internals/path');

var Promise = path.Promise;
var promiseTry = uncurryThis(Promise['try']);

module.exports = { 'try': function (callbackfn) {
  return promiseTry(isCallable(this) ? this : Promise, callbackfn);
} }['try'];
