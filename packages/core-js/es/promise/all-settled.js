'use strict';
require('../../modules/es.array.iterator');
require('../../modules/es.object.to-string');
require('../../modules/es.promise');
require('../../modules/es.promise.all-settled');
require('../../modules/es.string.iterator');
var uncurryThis = require('../../internals/function-uncurry-this');
var isCallable = require('../../internals/is-callable');
var path = require('../../internals/path');

var Promise = path.Promise;
var $allSettled = uncurryThis(Promise.allSettled);

module.exports = function allSettled(iterable) {
  return $allSettled(isCallable(this) ? this : Promise, iterable);
};
