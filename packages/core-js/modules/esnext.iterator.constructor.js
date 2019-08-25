'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var global = require('../internals/global');
var anInstance = require('../internals/an-instance');
var has = require('../internals/has');
var hide = require('../internals/hide');
var wellKnownSymbol = require('../internals/well-known-symbol');
var IteratorPrototype = require('../internals/iterators-core').IteratorPrototype;
var IS_PURE = require('../internals/is-pure');

var ITERATOR = wellKnownSymbol('iterator');
var TO_STRING_TAG = wellKnownSymbol('toStringTag');

var NativeIterator = global.Iterator;

// FF56- have non-standard global helper `Iterator`
var FORCED = IS_PURE || typeof NativeIterator != 'function' || NativeIterator.prototype !== IteratorPrototype;

var IteratorConstructor = function Iterator() {
  anInstance(this, IteratorConstructor);
};

if (IS_PURE) {
  IteratorPrototype = {};
  hide(IteratorPrototype, ITERATOR, function () {
    return this;
  });
}

if (!has(IteratorPrototype, TO_STRING_TAG)) {
  hide(IteratorPrototype, TO_STRING_TAG, 'Iterator');
}

IteratorConstructor.prototype = IteratorPrototype;

$({ global: true, forced: FORCED }, {
  Iterator: IteratorConstructor
});
