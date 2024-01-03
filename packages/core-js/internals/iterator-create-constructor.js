'use strict';
var IteratorPrototype = require('../internals/iterators-core').IteratorPrototype;
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var makeBuiltIn = require('../internals/make-built-in');
var setToStringTag = require('../internals/set-to-string-tag');
var Iterators = require('../internals/iterators');


module.exports = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT, TO_STRING_TAG) {
  TO_STRING_TAG = TO_STRING_TAG || NAME + ' Iterator';
  IteratorConstructor.prototype = Object.create(IteratorPrototype, {
    next: createPropertyDescriptor(+!ENUMERABLE_NEXT, makeBuiltIn(next, 'next')),
  });
  setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
  Iterators[TO_STRING_TAG] = function () { return this; };
  return IteratorConstructor;
};
