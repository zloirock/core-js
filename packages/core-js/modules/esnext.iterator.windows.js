'use strict';
var $ = require('../internals/export');
var anObject = require('../internals/an-object');
var call = require('../internals/function-call');
var createIteratorProxy = require('../internals/iterator-create-proxy');
var getIteratorDirect = require('../internals/get-iterator-direct');
var iteratorClose = require('../internals/iterator-close');
var uncurryThis = require('../internals/function-uncurry-this');

var $RangeError = RangeError;
var push = uncurryThis([].push);
var slice = uncurryThis([].slice);

var IteratorProxy = createIteratorProxy(function () {
  var iterator = this.iterator;
  var next = this.next;
  var buffer = this.buffer;
  var windowSize = this.windowSize;
  var result, done;
  while (true) {
    result = anObject(call(next, iterator));
    done = this.done = !!result.done;
    if (done) return;

    push(buffer, result.value);
    if (buffer.length === windowSize) {
      this.buffer = slice(buffer, 1);
      return buffer;
    }
  }
});

// `Iterator.prototype.windows` method
// https://github.com/tc39/proposal-iterator-chunking
$({ target: 'Iterator', proto: true, real: true, forced: true }, {
  windows: function windows(windowSize) {
    var O = anObject(this);
    if (typeof windowSize != 'number' || !windowSize || windowSize >>> 0 !== windowSize) {
      return iteratorClose(O, 'throw', new $RangeError('windowSize must be integer in [1, 2^32-1]'));
    }
    return new IteratorProxy(getIteratorDirect(O), {
      windowSize: windowSize,
      buffer: []
    });
  }
});
