'use strict';
var $ = require('../internals/export');
var anObject = require('../internals/an-object');
var anObjectOrUndefined = require('../internals/an-object-or-undefined');
var call = require('../internals/function-call');
var uncurryThis = require('../internals/function-uncurry-this');
var getBuiltIn = require('../internals/get-built-in');
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var getIteratorFlattenable = require('../internals/get-iterator-flattenable');
var getModeOption = require('../internals/get-mode-option');
var isDataDescriptor = require('../internals/is-data-descriptor');
var iteratorCloseAll = require('../internals/iterator-close-all');
var iteratorZip = require('../internals/iterator-zip');

var create = getBuiltIn('Object', 'create');
var ownKeys = getBuiltIn('Reflect', 'ownKeys');
var push = uncurryThis([].push);
var THROW = 'throw';

// `Iterator.zipKeyed` method
// https://github.com/tc39/proposal-joint-iteration
$({ target: 'Iterator', stat: true, forced: true }, {
  zipKeyed: function zipKeyed(iterables /* , options */) {
    anObject(iterables);
    var options = arguments.length > 1 ? anObjectOrUndefined(arguments[1]) : undefined;
    var mode = getModeOption(options);
    var paddingOption = mode === 'longest' ? anObjectOrUndefined(options && options.padding) : undefined;

    var iters = [];
    var padding = [];
    var allKeys = ownKeys(iterables);
    var keys = [];
    var desc, i, iter, key, value;
    for (i = 0; i < allKeys.length; i++) {
      key = allKeys[i];
      try {
        desc = getOwnPropertyDescriptor(iterables, key);
      } catch (error) {
        return iteratorCloseAll(iters, THROW, error);
      }
      if (!desc || !desc.enumerable) continue;
      value = undefined;
      if (isDataDescriptor(desc)) {
        value = desc.value;
      } else {
        var getter = desc.get;
        if (getter !== undefined) {
          try {
            value = call(getter, iterables);
          } catch (error) {
            return iteratorCloseAll(iters, THROW, error);
          }
        }
      }

      if (value !== undefined) {
        push(keys, key);
        try {
          iter = getIteratorFlattenable(value, true);
        } catch (error) {
          return iteratorCloseAll(iters, THROW, error);
        }
        push(iters, iter);
      }
    }

    var iterCount = iters.length;
    if (mode === 'longest') {
      if (paddingOption === undefined) {
        for (i = 0; i < iterCount; i++) push(padding, undefined);
      } else {
        for (i = 0; i < keys.length; i++) {
          try {
            value = paddingOption[keys[i]];
          } catch (error) {
            return iteratorCloseAll(iters, THROW, error);
          }
          push(padding, value);
        }
      }
    }

    return iteratorZip(iters, mode, padding, function (results) {
      var obj = create(null);
      for (var j = 0; j < iterCount; j++) {
        obj[keys[j]] = results[j];
      }
      return obj;
    });
  }
});
