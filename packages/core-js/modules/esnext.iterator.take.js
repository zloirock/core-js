'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var anObject = require('../internals/an-object');
var toLength = require('../internals/to-length');
var createIteratorProxy = require('../internals/create-iterator-proxy');

var IteratorProxy = createIteratorProxy(function () {
  if (!this.remaining--) {
    this.done = true;
    return;
  }
  var result = anObject(this.next.apply(this.iterator, arguments));
  var done = this.done = !!result.done;
  if (!done) return result.value;
});

$({ target: 'Iterator', proto: true, real: true }, {
  take: function take(limit) {
    return new IteratorProxy({
      iterator: anObject(this),
      remaining: toLength(limit)
    });
  }
});
