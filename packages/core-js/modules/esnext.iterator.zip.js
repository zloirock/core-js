'use strict';
var $ = require('../internals/export');
var anObject = require('../internals/an-object');
var anObjectOrUndefined = require('../internals/an-object-or-undefined');
var call = require('../internals/function-call');
var getIterator = require('../internals/get-iterator');
var getIteratorFlattenable = require('../internals/get-iterator-flattenable');
var getModeOption = require('../internals/get-mode-option');
var getPaddingOption = require('../internals/get-padding-option');
var iteratorClose = require('../internals/iterator-close');
var iteratorCloseAll = require('../internals/iterator-close-all');
var iteratorZip = require('../internals/iterator-zip');
var uncurryThis = require('../internals/function-uncurry-this');

var concat = uncurryThis([].concat);
var push = uncurryThis([].push);

// `Iterator.zip` method
// https://github.com/tc39/proposal-joint-iteration
$({ target: 'Iterator', stat: true, forced: true }, {
  zip: function zip(iterables /* , options */) {
    anObject(iterables);
    var options = arguments.length > 1 ? arguments[1] : undefined;
    anObjectOrUndefined(options);
    var mode = getModeOption(options);
    var paddingOption = mode === 'longest' ? getPaddingOption(options) : undefined;

    var iters = [];
    var padding = [];
    var inputIter = getIterator(iterables);
    var iter, done, result;
    while (!done) {
      try {
        result = anObject(call(inputIter.next, inputIter));
        done = result.done;
      } catch (error) {
        return iteratorCloseAll(iters, 'throw', error);
      }
      if (!done) {
        try {
          iter = getIteratorFlattenable(result.value, true);
        } catch (error) {
          return iteratorCloseAll(concat([inputIter], iters), 'throw', error);
        }
        push(iters, iter);
      }
    }

    var iterCount = iters.length;
    var i, paddingIter;
    if (mode === 'longest') {
      if (paddingOption === undefined) {
        for (i = 0; i < iterCount; i++) push(padding, undefined);
      } else {
        try {
          paddingIter = getIterator(paddingOption);
        } catch (error) {
          return iteratorCloseAll(iters, 'throw', error);
        }
        var usingIterator = true;
        for (i = 0; i < iterCount; i++) {
          if (usingIterator) {
            try {
              result = anObject(call(paddingIter.next, paddingIter));
            } catch (error) {
              return iteratorCloseAll(iters, 'throw', error);
            }
            if (result.done) {
              usingIterator = false;
            } else {
              push(padding, result.value);
            }
          } else {
            push(padding, undefined);
          }
        }

        if (usingIterator) {
          try {
            iteratorClose(paddingIter, 'normal');
          } catch (error) {
            return iteratorCloseAll(iters, 'throw', error);
          }
        }
      }
    }

    return iteratorZip(iters, mode, padding);
  }
});
