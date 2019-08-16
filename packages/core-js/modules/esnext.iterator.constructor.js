'use strict';
var $ = require('../internals/export');
var anInstance = require('../internals/an-instance');
var global = require('../internals/global');
var IteratorPrototype = require('../internals/iterators-core').IteratorPrototype;

var NativeIterator = global.Iterator;

// FF56- have non-standard global helper `Iterator`
var FORCED = typeof NativeIterator != 'function' || NativeIterator.prototype !== IteratorPrototype;

var IteratorConstructor = function Iterator() {
  anInstance(this, IteratorConstructor);
};

IteratorConstructor.prototype = IteratorPrototype;

$({ global: true, forced: FORCED }, {
  Iterator: IteratorConstructor
});
