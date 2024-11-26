'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var isCallable = require('../internals/is-callable');
var store = require('../internals/shared-store');

var functionToString = uncurryThis(Function.prototype.toString);

// Avoid recursion in `store.inspectSource`
if (!isCallable(store.inspectSource)) {
  store.inspectSource = function (it) {
    try {
      return isCallable(it) ? functionToString(it) : '';
    } catch (error) {
      // Fallback to an empty string if `functionToString` fails
      return '';
    }
  };
}

module.exports = store.inspectSource;
