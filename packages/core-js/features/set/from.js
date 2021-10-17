'use strict';
require('../../modules/es.array.iterator');
require('../../modules/es.set');
require('../../modules/es.string.iterator');
require('../../modules/esnext.set.from');
require('../../modules/web.dom-collections.iterator');
var uncurryThis = require('../../internals/function-uncurry-this');
var isCallable = require('../../internals/is-callable');
var path = require('../../internals/path');

var Set = path.Set;
var setFrom = uncurryThis(Set.from);

module.exports = function from(source, mapFn, thisArg) {
  return setFrom(isCallable(this) ? this : Set, source, mapFn, thisArg);
};
