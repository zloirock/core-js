'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var anInstance = require('../internals/an-instance');
var has = require('../internals/has');
var hide = require('../internals/hide');
var wellKnownSymbol = require('../internals/well-known-symbol');
var AsyncIteratorPrototype = require('../internals/async-iterator-prototype');
var IS_PURE = require('../internals/is-pure');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

var AsyncIteratorConstructor = function AsyncIterator() {
  anInstance(this, AsyncIteratorConstructor);
};

AsyncIteratorConstructor.prototype = AsyncIteratorPrototype;

if (!has(AsyncIteratorPrototype, TO_STRING_TAG)) {
  hide(AsyncIteratorPrototype, TO_STRING_TAG, 'AsyncIterator');
}

$({ global: true, forced: IS_PURE }, {
  AsyncIterator: AsyncIteratorConstructor
});
