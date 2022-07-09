'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var call = require('../internals/function-call');
var getIteratorDirect = require('../internals/get-iterator-direct');
var notANaN = require('../internals/not-a-nan');
var toPositiveInteger = require('../internals/to-positive-integer');
var createAsyncIteratorProxy = require('../internals/async-iterator-create-proxy');

var AsyncIteratorProxy = createAsyncIteratorProxy(function (Promise) {
  var iterator = this.iterator;
  var returnMethod, result;
  if (!this.remaining--) {
    result = { done: true, value: undefined };
    this.done = true;
    returnMethod = iterator['return'];
    if (returnMethod !== undefined) {
      return Promise.resolve(call(returnMethod, iterator, undefined)).then(function () {
        return result;
      });
    }
    return result;
  } return call(this.next, iterator);
});

$({ target: 'AsyncIterator', proto: true, real: true, forced: true }, {
  take: function take(limit) {
    return new AsyncIteratorProxy(getIteratorDirect(this), {
      remaining: toPositiveInteger(notANaN(+limit))
    });
  }
});
