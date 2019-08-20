'use strict';
var $ = require('../internals/export');
var anObject = require('../internals/an-object');
var toLength = require('../internals/to-length');
var createAsyncIteratorProxy = require('../internals/create-async-iterator-proxy');

var AsyncIteratorProxy = createAsyncIteratorProxy(function () {
  if (!this.remaining--) {
    this.done = true;
    return { done: true, value: undefined };
  } return this.next.apply(this.iterator, arguments);
});

$({ target: 'AsyncIterator', proto: true }, {
  take: function take(limit) {
    return new AsyncIteratorProxy({
      iterator: anObject(this),
      remaining: toLength(limit)
    });
  }
});
