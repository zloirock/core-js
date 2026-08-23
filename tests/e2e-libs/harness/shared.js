'use strict';
// What both page programs answer the same way. Loaded before either and read through `window`, so a
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

  // element by element, never through a joined string: a separator can occur INSIDE a label, and two
  // different sequences would join to the same text. The index tells the reader WHERE they parted.
  window.e2eLabelDrift = function (checks, expected) {
    var i;
    for (i = 0; i < checks.length && i < expected.length; i++) {
      if (checks[i].label !== expected[i]) return i;
    }
    return -1;
  };

  // `then` is the one replaceable method these programs may call, and the rejection handler goes to
  // that same `then` rather than a later `.catch`, which a substituted implementation could drop.
  window.e2eRun = function (onChecks, onError) {
    function handOver(res) {
      onChecks((res && res.checks) || []);
    }
    try {
      var res = E2E.run();
      if (res && typeof res.then === 'function') res.then(handOver, onError);
      else handOver(res);
    } catch (err) { onError(err); }
  };
}());
