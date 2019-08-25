'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var anObject = require('../internals/an-object');
var toLength = require('../internals/to-length');
var createIteratorProxy = require('../internals/create-iterator-proxy');

var IteratorProxy = createIteratorProxy(function () {
  var iterator = this.iterator;
  var next = this.next;
  var result, done;
  while (this.remaining) {
    this.remaining--;
    result = anObject(next.apply(iterator, arguments));
    done = this.done = !!result.done;
    if (done) return;
  }
  result = anObject(next.apply(iterator, arguments));
  done = this.done = !!result.done;
  if (!done) return result.value;
});

$({ target: 'Iterator', proto: true, real: true }, {
  drop: function drop(limit) {
    return new IteratorProxy({
      iterator: anObject(this),
      remaining: toLength(limit)
    });
  }
});
