'use strict';
// What the artifact page and the browser leg answer the same way - loaded ahead of the program on
// the artifact page, in the driver's page and in every cell's frame, and read through `window`, so a
// missing file is a name error at the call rather than a silent `undefined`. They are one instrument
// and carry the same guards, which is what these four are: a guard written twice drifts once.
(function () {
  var nextTurn = typeof setTimeout === 'function' && setTimeout;
  var isArray = Array.isArray;
  var prototypeOf = Object.getPrototypeOf;
  var ownNames = Object.getOwnPropertyNames;
  // eslint-disable-next-line es/no-reflect -- use one key enumeration when the engine supports Proxy
  var allKeys = typeof Reflect === 'object' && Reflect.ownKeys;
  // eslint-disable-next-line es/no-object-getownpropertysymbols -- optional on engines with native symbol keys
  var ownSymbols = Object.getOwnPropertySymbols;
  var ownDescriptor = Object.getOwnPropertyDescriptor;
  var dateText = Date.prototype.toString;
  var functionText = Function.prototype.toString;
  var regexpSource = ownDescriptor(RegExp.prototype, 'source');
  var regexpFlags = [];
  var flagNames = ['hasIndices', 'global', 'ignoreCase', 'multiline', 'dotAll', 'unicode', 'unicodeSets', 'sticky'];
  for (var f = 0; f < flagNames.length; f++) regexpFlags[f] = ownDescriptor(RegExp.prototype, flagNames[f]);
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

  function diagnosticKeys(value) {
    if (allKeys) return allKeys(value);
    var keys = ownNames(value);
    if (ownSymbols) {
      var symbols = ownSymbols(value);
      for (var i = 0; i < symbols.length; i++) keys[keys.length] = symbols[i];
    }
    return keys;
  }

  // QUnit infers DOM and builtin types from property names. Give it data fields
  // in a separate namespace, including array slots, so a field cannot select a formatter.
  function reportKey(copy, key) {
    if (typeof key !== 'symbol') return '.' + key;
    var label = '[' + String(key) + ']';
    while (ownDescriptor(copy, label)) label += '#';
    return label;
  }

  // QUnit normally displays Date and RegExp by value. Read their native slots
  // without consulting an instance's toString, flags, or Symbol.toStringTag.
  function reportBuiltin(copy, value) {
    try {
      copy['[[Date]]'] = dateText.call(value);
      return;
    } catch (error) { /* not a Date */ }
    if (!regexpSource || !regexpSource.get) return; // Older engines store the fields on the instance.
    try {
      var source = regexpSource.get.call(value);
      var flags = '';
      for (var i = 0; i < regexpFlags.length; i++) {
        var flag = regexpFlags[i];
        if (flag && flag.get && flag.get.call(value)) flags += 'dgimsuvy'.charAt(i);
      }
      copy['[[RegExp]]'] = '/' + source + '/' + flags;
    } catch (error) { /* not a RegExp */ }
  }

  function functionDescriptor(fn, key) {
    try {
      return ownDescriptor(fn, key);
    } catch (error) { return undefined; } // A function proxy can hide one field and expose the other.
  }

  function snapshotDiagnostic(value, copies, forQUnit) {
    var callable = typeof value === 'function';
    if (!value || typeof value !== 'object' && !(forQUnit && callable)) return value;
    for (var i = 0; i < copies.length; i += 2) if (copies[i] === value) return copies[i + 1];
    var slot = copies.length + 1;
    var fallback = forQUnit ? '<uninspectable>' : value;
    copies[slot - 1] = value;
    copies[slot] = fallback;
    try {
      if (callable) {
        var fn = create(null);
        var fnName = functionDescriptor(value, 'name');
        // IE11 can expose the declaration name only in the native source text.
        var declaration = !fnName && /^\s*function\s+([^\s(]+)/.exec(functionText.call(value));
        fn['[[Function]]'] = fnName && typeof fnName.value === 'string' ? fnName.value : declaration ? declaration[1] : '';
        var fnLength = functionDescriptor(value, 'length');
        if (fnLength && typeof fnLength.value === 'number') fn['.length'] = fnLength.value;
        copies[slot] = fn;
        return fn;
      }
      var array = isArray(value);
      var prototype = prototypeOf(value);
      var instance = !array && prototype && prototypeOf(prototype) !== null;
      if (instance && !forQUnit) return value;
      var keys = diagnosticKeys(value);
      // Complete reflection before making the copy visible to another reference.
      var descriptors = [];
      var length = array ? value.length : 0;
      var asArray = !forQUnit && array && (length >>> 0) === length;
      for (var k = 0; k < keys.length; k++) {
        var name = keys[k];
        var descriptor = ownDescriptor(value, name);
        descriptors[k] = descriptor;
        if (typeof name === 'symbol') {
          if (descriptor && descriptor.enumerable) asArray = false;
        } else if (asArray && arrayIndex(name) && +name >= length) asArray = false;
      }
      var copy = asArray ? [] : create(forQUnit || array ? null : prototype);
      copies[slot] = copy;
      if (instance) reportBuiltin(copy, value);
      if (array) {
        if (forQUnit) {
          copy['[[Array]]'] = true;
          copy['.length'] = snapshotDiagnostic(length, copies, true);
        } else copy.length = length;
      }
      for (var n = 0; n < keys.length; n++) {
        var key = keys[n];
        var field = descriptors[n];
        var index = array && typeof key === 'string' && arrayIndex(key);
        var builtinField = instance && (key === 'message' || key === 'name' || !regexpSource && (
          key === 'source' || key === 'global' || key === 'ignoreCase' || key === 'multiline'
        ));
        if (field && (field.enumerable || index || builtinField)) {
          var observed = 'value' in field ? snapshotDiagnostic(field.value, copies, forQUnit) : '<accessor>';
          define(copy, forQUnit ? reportKey(copy, key) : key, { enumerable: forQUnit || field.enumerable, value: observed });
        }
      }
      if (!forQUnit) for (var j = 0; j < keys.length; j++) {
        var symbol = keys[j];
        if (typeof symbol === 'symbol' && descriptors[j] && descriptors[j].enumerable) {
          define(copy, reportKey(copy, symbol), { enumerable: true, value: copy[symbol] });
        }
      }
      return copy;
    } catch (error) {
      copies[slot] = fallback;
      return fallback;
    }
  }

  // `then` is the one replaceable method these programs may call, and the rejection handler goes to
  // that same `then` rather than a later `.catch`, which a substituted implementation could drop.
  window.e2eRun = function (onChecks, onError, options) {
    var forQUnit = options && options.forQUnit;
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
            var copies = [];
            if (isArray(pair)) {
              rows[i].difference = {
                path: difference.path, missing: difference.missing,
                pair: [snapshotDiagnostic(pair[0], copies, forQUnit), snapshotDiagnostic(pair[1], copies, forQUnit)],
              };
            } else if (forQUnit) {
              rows[i].actual = snapshotDiagnostic(rows[i].actual, copies, true);
              rows[i].expected = snapshotDiagnostic(rows[i].expected, copies, true);
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
