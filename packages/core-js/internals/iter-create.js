'use strict';
var create = require('../internals/object-create');
var descriptor = require('../internals/property-desc');
var setToStringTag = require('../internals/set-to-string-tag');
var ITERATOR = require('core-js-internals/well-known-symbol')('iterator');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('../internals/hide')(IteratorPrototype, ITERATOR, function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};
