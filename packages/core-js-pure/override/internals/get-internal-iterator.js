'use strict';
var classof = require('../internals/classof');
var hasOwn = require('../internals/has-own-property');
var Iterators = require('../internals/iterators');

module.exports = function (it) {
  var klass = classof(it);
  if (klass === 'Arguments') klass = 'Array';
  return hasOwn(Iterators, klass) ? Iterators[klass] : undefined;
};
