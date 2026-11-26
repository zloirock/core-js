'use strict';
// What the artifact page and the browser leg answer the same way - loaded ahead of the program on
// the artifact page, in the driver's page and in every cell's frame, and read through `window`, so a
// missing file is a name error at the call rather than a silent `undefined`. They are one instrument
// and carry the same guards, which is what these four are: a guard written twice drifts once.
(function () {
  var nextTurn = typeof setTimeout === 'function' && setTimeout;
  var isArray = Array.isArray;
  var prototypeOf = Object.getPrototypeOf;
  var ownKeys = Object.keys;
  var ownNames = Object.getOwnPropertyNames;
  var ownDescriptor = Object.getOwnPropertyDescriptor;
  var create = Object.create;
  var define = Object.defineProperty;
  function errorField(err, key) {
    try {
      var value = err && err[key];
      if (value) return String(value);
    } catch (error) { /* try the next source of diagnostic text */ }
    return '';
  }

  // A rejection may carry an arbitrary object, including throwing getters.
  window.e2eReason = function (err) {
    var message = errorField(err, 'message');
    if (message) return message;
    try {
      var text = String(err);
      if (text && text !== '[object Object]') return text;
    } catch (error) { /* try the name */ }
    return errorField(err, 'name') || 'failed without a message';
  };

  function arrayIndex(key) {
    return '' + (key >>> 0) === key && key !== '4294967295';
  }

  // Both the standalone page and QUnit show the location recorded by the checker.
  window.e2eCheckResult = function (check) {
    var result = { result: check.pass, actual: check.actual, expected: check.expected, message: check.label };
    var difference = check.difference;
    if (difference && isArray(difference.pair)) {
      result.actual = difference.missing === 'actual' ? '<missing>' : difference.pair[0];
      result.expected = difference.missing === 'expected' ? '<missing>' : difference.pair[1];
      if (difference.path) result.message += ' at ' + difference.path;
      if (difference.missing) result.message += ' (missing on ' + difference.missing + ')';
    }
    return result;
  };

  // Only IE exposes documentMode, and its compatibility modes report 5 through 10 while serving a
  // DIFFERENT set of natives from the 11 this suite targets, so a page rendered in one measures an
  // engine nothing here names. Every other browser has none at all and is a legitimate target.
  window.e2eCompatibilityMode = function () {
    var mode = window.document && document.documentMode;
    return mode === undefined || mode === 11 ? undefined : mode;
  };

  window.e2eLabelProblem = function (checks, expected) {
    var i = 0;
    while (i < checks.length && i < expected.length && checks[i].label === expected[i]) i++;
    if (i < expected.length) {
      var actual = i < checks.length ? '"' + checks[i].label + '"' : 'no check';
      return 'check #' + (i + 1) + ' expected "' + expected[i] + '" from the raw exercise, got ' + actual;
    }
    if (i < checks.length) return 'unexpected check "' + checks[i].label + '" at #' + (i + 1);
    return null;
  };

  // Preserve data in the usual diagnostic containers without calling their getters.
  function snapshotDiagnostic(value, copies) {
    if (!value || typeof value !== 'object') return value;
    for (var i = 0; i < copies.length; i += 2) if (copies[i] === value) return copies[i + 1];
    var slot = copies.length + 1;
    copies[slot - 1] = value;
    copies[slot] = value;
    try {
      var array = isArray(value);
      var prototype = prototypeOf(value);
      if (!array && prototype && prototypeOf(prototype) !== null) return value;
      var keys = array ? ownNames(value) : ownKeys(value);
      var copy = array ? [] : create(prototype);
      if (array) {
        var length = value.length;
        // A Proxy can report a length inconsistent with its own indices. A record
        // keeps both observations without growing an array as the slots are copied.
        if ((length >>> 0) !== length) copy = create(null);
        else for (var j = 0; j < keys.length; j++) {
          if (arrayIndex(keys[j]) && +keys[j] >= length) {
            copy = create(null);
            break;
          }
        }
        copy.length = length;
      }
      // Complete reflection before making the copy visible to another reference.
      var descriptors = [];
      for (var k = 0; k < keys.length; k++) {
        descriptors[k] = ownDescriptor(value, keys[k]);
      }
      copies[slot] = copy;
      for (var n = 0; n < keys.length; n++) {
        var key = keys[n];
        var field = descriptors[n];
        var index = array && arrayIndex(key);
        if (field && 'value' in field && (field.enumerable || index)) {
          define(copy, key, { enumerable: field.enumerable, value: snapshotDiagnostic(field.value, copies) });
        }
      }
      return copy;
    } catch (error) {
      copies[slot] = value;
      return value;
    }
  }

  // `then` is the one replaceable method these programs may call, and the rejection handler goes to
  // that same `then` rather than a later `.catch`, which a substituted implementation could drop.
  window.e2eRun = function (onChecks, onError) {
    var settled = false;
    var reported = false;
    var jobs = 0;

    function cancel() {
      settled = true;
      window.e2eOnUncaughtError = null;
    }

    function fail(err) {
      if (settled) return;
      cancel();
      onError(err);
    }

    // An independent rejection takes precedence over the error reported by the exercise.
    function deferFailure(err) {
      window.e2eAfterRejections(function () {
        if (!settled && !uncaughtError()) fail(err);
      });
    }

    function uncaughtError() {
      var failure = window.e2eUncaughtError;
      if (failure === undefined) return false;
      fail(new Error(failure.message || 'unhandled rejection - ' + window.e2eReason(failure.rejection)));
      return true;
    }

    function handOver(res) {
      if (reported || settled || uncaughtError()) return;
      reported = true;
      try {
        var checks = res && res.checks;
        if (!isArray(checks)) throw new TypeError('run() did not return a checks array');
        var rows = [];
        for (var i = 0; i < checks.length; i++) {
          var check = checks[i];
          var label = check && check.label;
          var pass = check && check.pass;
          if (typeof label !== 'string' || typeof pass !== 'boolean') {
            throw new TypeError('run() returned a malformed check at index ' + i);
          }
          rows[i] = { label: label, pass: pass, actual: check.actual, expected: check.expected };
          if (!pass) {
            var difference = check.difference;
            var pair = difference && difference.pair;
            if (isArray(pair)) {
              var copies = [];
              rows[i].difference = {
                path: difference.path, missing: difference.missing,
                pair: [snapshotDiagnostic(pair[0], copies), snapshotDiagnostic(pair[1], copies)],
              };
            }
          }
        }
        window.e2eAfterRejections(function () {
          if (settled || uncaughtError()) return;
          cancel();
          try {
            onChecks(rows);
          } catch (err) { onError(err); }
        });
      } catch (err) { deferFailure(err); }
    }

    // A thenable's first notification wins. Separate uncaught errors can still fail the frame.
    function reject(err) {
      if (reported || settled) return;
      reported = true;
      deferFailure(err);
    }

    // Each thenable can notify once, including while the value it supplied is still pending.
    function resolve(value, nested) {
      if (settled || reported) return;
      var then = value && (typeof value === 'object' || typeof value === 'function') && value.then;
      if (typeof then !== 'function') {
        handOver(value);
        return;
      }
      function subscribe() {
        if (settled || reported) return;
        var called = false;
        try {
          Function.prototype.call.call(then, value, function (next) {
            if (called) return;
            called = true;
            try {
              resolve(next, true);
            } catch (err) { reject(err); }
          }, function (err) {
            if (called) return;
            called = true;
            reject(err);
          });
        } catch (err) {
          if (!called) reject(err);
        }
      }
      if (!nested) subscribe();
      // A chain of fresh thenables can also starve the page and frame timers.
      else if (nextTurn && ++jobs % 128 === 0) nextTurn.call(window, function () { window.e2eQueueJob(subscribe); }, 0);
      else window.e2eQueueJob(subscribe);
    }

    window.e2eOnUncaughtError = uncaughtError;
    try {
      if (!uncaughtError()) {
        if (typeof E2E === 'undefined' || !E2E || typeof E2E.run !== 'function') throw new Error('the bundle did not expose E2E.run');
        resolve(E2E.run());
      }
    } catch (err) { reject(err); }
    return cancel;
  };
}());
