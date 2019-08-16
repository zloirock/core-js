'use strict';
var $ = require('../internals/export');
var anInstance = require('../internals/an-instance');
var AsyncIteratorPrototype = require('../internals/async-iterator-prototype');

var AsyncIteratorConstructor = function AsyncIterator() {
  anInstance(this, AsyncIteratorConstructor);
};

AsyncIteratorConstructor.prototype = AsyncIteratorPrototype;

$({ global: true }, {
  AsyncIterator: AsyncIteratorConstructor
});
