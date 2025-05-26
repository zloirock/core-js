'use strict';
var call = require('../internals/function-call');
var createIteratorProxy = require('../internals/iterator-create-proxy');
var iteratorCloseAll = require('../internals/iterator-close-all');
var uncurryThis = require('../internals/function-uncurry-this');

var $TypeError = TypeError;
var slice = uncurryThis([].slice);
var push = uncurryThis([].push);
var ITERATOR_IS_EXHAUSTED = 'Iterator is exhausted';

// eslint-disable-next-line max-statements -- specification case
var IteratorProxy = createIteratorProxy(function () {
  var iterCount = this.iterCount;
  if (!iterCount) {
    this.done = true;
    return;
  }
  var openIters = this.openIters;
  var iters = this.iters;
  var padding = this.padding;
  var mode = this.mode;
  var finishResults = this.finishResults;

  var results = [];
  var result, done;
  for (var i = 0; i < iterCount; i++) {
    var iter = iters[i];
    if (iter === null) {
      push(results, padding[i]);
    } else {
      try {
        result = call(iter.next, iter.iterator);
        done = result.done;
        result = result.value;
      } catch (error) {
        openIters[i] = undefined;
        return iteratorCloseAll(openIters, 'throw', error);
      }
      if (done) {
        openIters[i] = undefined;
        if (mode === 'shortest') {
          this.done = true;
          return iteratorCloseAll(openIters, 'return', undefined);
        }
        if (mode === 'strict') {
          if (i) {
            this.done = true;
            return iteratorCloseAll(openIters, 'throw', new $TypeError(ITERATOR_IS_EXHAUSTED));
          }

          var open;
          for (var k = 1; k < iterCount; k++) {
            // eslint-disable-next-line max-depth -- specification case
            try {
              open = call(iters[k].next, iters[k].iterator);
            } catch (error) {
              openIters[k] = undefined;
              return iteratorCloseAll(openIters, 'throw', open);
            }
            // eslint-disable-next-line max-depth -- specification case
            if (!open.value) {
              openIters[k] = undefined;
            } else {
              this.done = true;
              return iteratorCloseAll(openIters, 'throw', new $TypeError(ITERATOR_IS_EXHAUSTED));
            }
          }
          this.done = true;
          return;
        }
        var isEmptyOpenIters = true;
        for (var j = 0; j < openIters.length; j++) {
          if (openIters[j] === undefined) continue;
          isEmptyOpenIters = false;
          break;
        }
        if (isEmptyOpenIters) {
          this.done = true;
          return;
        }
        iters[i] = null;
        result = padding[i];
      }
    }
    push(results, result);
  }

  return finishResults !== undefined ? finishResults(results) : results;
});

module.exports = function (iters, mode, padding, finishResults) {
  var iterCount = iters.length;
  var openIters = slice(iters, 0);

  return new IteratorProxy({
    iters: iters,
    iterCount: iterCount,
    openIters: openIters,
    mode: mode,
    padding: padding,
    finishResults: finishResults
  });
};
