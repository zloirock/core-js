'use strict';
var isObject = require('../internals/is-object');
var hasOwn = require('../internals/has-own-property');
var classof = require('../internals/classof');
var TypedArrayConstructors = require('../internals/typed-array-constructors');

module.exports = function (it) {
  return isObject(it) ? hasOwn(TypedArrayConstructors, classof(it)) : false;
};
