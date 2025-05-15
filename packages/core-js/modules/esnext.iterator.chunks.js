'use strict';
var $ = require('../internals/export');
var anObject = require('../internals/an-object');
var call = require('../internals/function-call');
var createIteratorProxy = require('../internals/iterator-create-proxy');
var getIteratorDirect = require('../internals/get-iterator-direct');
var numberIsFinite = require('../internals/number-is-finite');

var $RangeError = RangeError;

var IteratorProxy = createIteratorProxy(function () {
  var iterator = this.iterator;
  var next = this.next;
  var result, done;
  var buffer = [];
  while (true) {
    result = anObject(call(next, iterator));
    done = !!result.done;
    if (done) {
      if (buffer.length) return buffer;
      this.done = true;
      return;
    }
    buffer.push(result.value);
    if (buffer.length === this.chunkSize) return buffer;
  }
});

// `Iterator.prototype.chunks` method
// https://github.com/tc39/proposal-iterator-chunking
$({ target: 'Iterator', proto: true, real: true, forced: true }, {
  chunks: function chunks(chunkSize) {
    var O = anObject(this);
    if (!numberIsFinite(chunkSize) || chunkSize < 1 || chunkSize > 0xFFFFFFFF) {
      throw $RangeError('chunkSize must be integral Number in [1, 2^32-1]');
    }
    return new IteratorProxy(getIteratorDirect(O), {
      chunkSize: chunkSize
    });
  }
});
