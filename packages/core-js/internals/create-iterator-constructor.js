'use strict';
var create = require('../internals/object-create');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var setToStringTag = require('../internals/set-to-string-tag');
var ITERATOR = require('../internals/well-known-symbol')('iterator');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('../internals/hide')(IteratorPrototype, ITERATOR, function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator', false, true);
  return Constructor;
};
