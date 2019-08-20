'use strict';
var $ = require('../internals/export');
var global = require('../internals/global');
var anInstance = require('../internals/an-instance');
var has = require('../internals/has');
var hide = require('../internals/hide');
var wellKnownSymbol = require('../internals/well-known-symbol');
var IteratorPrototype = require('../internals/iterators-core').IteratorPrototype;

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

var NativeIterator = global.Iterator;

// FF56- have non-standard global helper `Iterator`
var FORCED = typeof NativeIterator != 'function' || NativeIterator.prototype !== IteratorPrototype;

var IteratorConstructor = function Iterator() {
  anInstance(this, IteratorConstructor);
};

IteratorConstructor.prototype = IteratorPrototype;

if (!has(IteratorPrototype, TO_STRING_TAG)) {
  hide(IteratorPrototype, TO_STRING_TAG, 'Iterator');
}

$({ global: true, forced: FORCED }, {
  Iterator: IteratorConstructor
});
