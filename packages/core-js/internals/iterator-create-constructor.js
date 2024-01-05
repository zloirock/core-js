'use strict';
var IteratorPrototype = require('../internals/iterator-prototype');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var makeBuiltIn = require('../internals/make-built-in');
var setToStringTag = require('../internals/set-to-string-tag');

module.exports = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT, TO_STRING_TAG) {
  TO_STRING_TAG = TO_STRING_TAG || NAME + ' Iterator';
  IteratorConstructor.prototype = Object.create(IteratorPrototype, {
    next: createPropertyDescriptor(+!ENUMERABLE_NEXT, makeBuiltIn(next, 'next')),
  });
  setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
  return IteratorConstructor;
};
