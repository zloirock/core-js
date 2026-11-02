'use strict';
var $ = require('../internals/export');
var fromAsync = require('../internals/array-from-async');
var fails = require('../internals/fails');
var V8_VERSION = require('../internals/environment-v8-version');
var ENVIRONMENT = require('../internals/environment');
var wellKnownSymbol = require('../internals/well-known-symbol');

// eslint-disable-next-line es/no-array-fromasync -- safe
var nativeFromAsync = Array.fromAsync;
// V8 incorrectly closes iterators on step errors and retries failed cleanup.
// https://issues.chromium.org/issues/511947515
// This cannot be detected synchronously.
var FORCED = V8_VERSION && ENVIRONMENT !== 'BUN' || !nativeFromAsync || fails(function () {
  // https://bugs.webkit.org/show_bug.cgi?id=271703
  var counter = 0;
  nativeFromAsync.call(function () {
    counter++;
    return [];
  }, { length: 0 });
  if (counter !== 1) return true;
  // Firefox and Safari do not capture `next` before calling the constructor.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=2088041
  // https://bugs.webkit.org/show_bug.cgi?id=326074
  // This also avoids Firefox masking the original error when cleanup rejects.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=2078778
  var changedNextCalled = false;
  var iterable = {};
  var iterator = { next: function () { return { done: true }; } };
  iterable[wellKnownSymbol('asyncIterator')] = function () { return iterator; };
  nativeFromAsync.call(function () {
    iterator.next = function () {
      changedNextCalled = true;
      return { done: true };
    };
    return [];
  }, iterable);
  return changedNextCalled;
});

// `Array.fromAsync` method
// https://tc39.es/ecma262/#sec-array.fromasync
$({ target: 'Array', stat: true, forced: FORCED }, {
  fromAsync: fromAsync
});
