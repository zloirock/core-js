'use strict';
var $ = require('../internals/export');
var anObject = require('../internals/an-object');
var anObjectOrUndefined = require('../internals/an-object-or-undefined');
var call = require('../internals/function-call');
var uncurryThis = require('../internals/function-uncurry-this');
var getBuiltInStaticMethod = require('../internals/get-built-in-static-method');
var propertyIsEnumerableModule = require('../internals/object-property-is-enumerable');
var getIteratorFlattenable = require('../internals/get-iterator-flattenable');
var getModeOption = require('../internals/get-mode-option');
var iteratorCloseAll = require('../internals/iterator-close-all');
var iteratorZip = require('../internals/iterator-zip');

var create = Object.create;
// dependency: es.reflect.own-keys
var ownKeys = getBuiltInStaticMethod('Reflect', 'ownKeys');
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
    var propertyIsEnumerable = propertyIsEnumerableModule.f;
    var i, key, value;
    for (i = 0; i < allKeys.length; i++) try {
      key = allKeys[i];
      if (!call(propertyIsEnumerable, iterables, key)) continue;
      value = iterables[key];
      if (value !== undefined) {
        push(keys, key);
        push(iters, getIteratorFlattenable(value, true));
      }
    } catch (error) {
      return iteratorCloseAll(iters, THROW, error);
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
  },
});
