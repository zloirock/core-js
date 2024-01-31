'use strict';
var $ = require('../internals/export');
var anObject = require('../internals/an-object');
var call = require('../internals/function-call');
var createIteratorProxy = require('../internals/iterator-create-proxy');
var getIteratorDirect = require('../internals/get-iterator-direct');
var chunkSizeValidation = require('../internals/iterator-chunk-size-validation');
var uncurryThis = require('../internals/function-uncurry-this');
var IS_PURE = require('../internals/is-pure');

var push = uncurryThis([].push);

var IteratorProxy = createIteratorProxy(function () {
  var iterator = this.iterator;
  var next = this.next;
  var chunkSize = this.chunkSize;
  var buffer = [];
  var result, done;
  while (true) {
    result = anObject(call(next, iterator));
    done = !!result.done;
    if (done) {
      if (buffer.length) return buffer;
      this.done = true;
      return;
    }
    push(buffer, result.value);
    if (buffer.length === chunkSize) return buffer;
  }
});

// `Iterator.prototype.chunks` method
// https://github.com/tc39/proposal-iterator-chunking
// dependency: es.iterator.constructor
$({ target: 'Iterator', proto: true, real: true, forced: IS_PURE }, {
  chunks: function chunks(chunkSize) {
    anObject(this);
    chunkSizeValidation(chunkSize, this);
    return new IteratorProxy(getIteratorDirect(this), {
      chunkSize: chunkSize,
    });
  },
});
