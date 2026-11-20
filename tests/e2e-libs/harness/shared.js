'use strict';
// What the artifact page and the browser leg answer the same way - loaded ahead of the program on
// the artifact page, in the driver's page and in every cell's frame, and read through `window`, so a
// missing file is a name error at the call rather than a silent `undefined`. They are one instrument
// and carry the same guards, which is what these four are: a guard written twice drifts once.
(function () {
  function nameOf(err) {
    return err && err.name ? String(err.name) : 'failed without a message';
  }

  // The ES5 twin of `errorReason` in ../diagnostics.mjs, for a page with no stderr and no line to
  // trim to.
  window.e2eReason = function (err) {
    if (err && err.message) return String(err.message);
    var text;
    // a throwable that cannot be stringified is still a throwable, and this runs on the path that
    // reports one - where the banner has already latched settled, so a throw strands "running..."
    try {
      text = String(err);
    } catch (error) {
      return nameOf(err);
    }
    // a rejected promise carries whatever the library threw, and stringifying an object is not a reason
    return text === '[object Object]' ? nameOf(err) : text;
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

  function afterRejections(callback) {
    // Let the current microtask checkpoint queue unhandledrejection, then queue toggle on
    // the same DOM manipulation task source so delivery precedes the verdict.
    setTimeout(function () {
      if (typeof window.PromiseRejectionEvent === 'function') {
        var details = document.createElement('details');
        if (typeof details.open === 'boolean' && 'ontoggle' in details) {
          details.ontoggle = callback;
          details.open = true;
          return;
        }
      }
      // IE11's Promise polyfill dispatches unhandledrejection through native setImmediate.
      if (typeof window.setImmediate === 'function') window.setImmediate(callback);
      else setTimeout(callback, 0);
    }, 0);
  }

  // `then` is the one replaceable method these programs may call, and the rejection handler goes to
  // that same `then` rather than a later `.catch`, which a substituted implementation could drop.
  window.e2eRun = function (onChecks, onError) {
    var settled = false;
    var reported = false;

    function fail(err) {
      if (settled) return;
      settled = true;
      window.e2eOnUncaughtError = null;
      onError(err);
    }

    // An independent rejection takes precedence over the error reported by the exercise.
    function deferFailure(err) {
      afterRejections(function () {
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
        if (!Array.isArray(checks)) throw new TypeError('run() did not return a checks array');
        var rows = [];
        for (var i = 0; i < checks.length; i++) {
          var check = checks[i];
          var label = check && check.label;
          var pass = check && check.pass;
          if (typeof label !== 'string' || typeof pass !== 'boolean') {
            throw new TypeError('run() returned a malformed check at index ' + i);
          }
          rows[i] = { label: label, pass: pass, actual: check.actual, expected: check.expected };
        }
        afterRejections(function () {
          if (settled || uncaughtError()) return;
          settled = true;
          window.e2eOnUncaughtError = null;
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

    window.e2eOnUncaughtError = uncaughtError;
    try {
      if (uncaughtError()) return;
      if (typeof E2E === 'undefined' || !E2E || typeof E2E.run !== 'function') throw new Error('the bundle did not expose E2E.run');
      var res = E2E.run();
      if (res && typeof res.then === 'function') res.then(handOver, reject);
      else handOver(res);
    } catch (err) { reject(err); }
  };
}());
