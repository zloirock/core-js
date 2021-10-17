'use strict';
require('../../modules/es.aggregate-error');
require('../../modules/es.array.iterator');
require('../../modules/es.object.to-string');
require('../../modules/es.promise');
require('../../modules/es.promise.any');
require('../../modules/es.string.iterator');
var uncurryThis = require('../../internals/function-uncurry-this');
var isCallable = require('../../internals/is-callable');
var path = require('../../internals/path');

var Promise = path.Promise;
var $any = uncurryThis(Promise.any);

module.exports = function any(iterable) {
  return $any(isCallable(this) ? this : Promise, iterable);
};
