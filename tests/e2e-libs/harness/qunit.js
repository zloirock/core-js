'use strict';
// The browser leg's program, driven by `tests/karma/e2e-libs.mjs`: ONE karma session for every cell,
// each cell's `frame.html` loaded into an iframe of its own - its own realm, so one cell's injection
// cannot mask another cell's miss - and removed before the next cell starts. One QUnit test per cell.
// Each check becomes its own pushResult, so a red run names the check rather than the bundle, and an
// empty `checks` fails explicitly instead of passing as a test with zero assertions. Karma's summary
// on a green run is only "Executed N of N", which is why the console line reports the count per cell.
(function () {
  var FRAMES = window.E2E_FRAMES;
  var current = null;

  // the frames' URLs are relative to the list's own: karma serves a file outside its basePath under
  // a path that differs by platform, and the list's `<script>` is the one anchor this page can read
  var BASE, i, match;
  var scripts = document.getElementsByTagName('script');
  for (i = 0; i < scripts.length; i++) {
    match = /^(.*\/)frames\.js(?:\?.*)?$/.exec(scripts[i].src);
    if (match) BASE = match[1];
  }
  if (BASE === undefined) throw new Error('e2e-libs: the frame list was not loaded from a <script>');

  function dispose() {
    if (current && current.parentNode) current.parentNode.removeChild(current);
    current = null;
  }

  function define(entry) {
    QUnit.test(entry.label, function (assert) {
      assert.timeout(entry.timeout);
      var done = assert.async();
      // a frame that never reported - its test timed out - goes before this one starts, so a late
      // report of its own reaches this handler and fails the label assertion below instead of passing
      dispose();
      window.e2eFrameDone = function (label, expected, mode, checks, reason) {
        window.e2eFrameDone = null;
        assert.strictEqual(label, entry.label, entry.label + ': the frame reports the cell it was loaded for');
        // a compatibility mode is the one engine this leg must refuse
        assert.ok(mode === undefined, entry.label + ': expected standards mode, got documentMode=' + mode);
        if (reason !== null) {
          assert.ok(false, entry.label + ': ' + reason);
        } else {
          var passed = 0,
              k;
          for (k = 0; k < checks.length; k++) if (checks[k].pass) passed++;
          if (window.console && window.console.log) {
            window.console.log('[e2e-libs] ' + entry.label + ': ' + passed + '/' + checks.length + ' checks passed');
          }
          // an exercise reporting FEWER checks here than in node must not pass on the ones it did report.
          // `expected` is always non-empty, since runtime.mjs refuses a zero-length pre-flight result
          assert.strictEqual(checks.length, expected.length, entry.label + ': check count differs from the node pre-flight');
          // the same COUNT under different labels is a different run: a branch that stopped executing and
          // another that started cancel out in the count alone
          var drift = window.e2eLabelDrift(checks, expected);
          assert.strictEqual(drift, -1, drift === -1 ? entry.label + ': check labels match the node pre-flight'
            : entry.label + ': check ' + drift + ' is "' + checks[drift].label + '" here, "' + expected[drift] + '" in the node pre-flight');
          for (k = 0; k < checks.length; k++) {
            assert.pushResult({
              result: !!checks[k].pass, actual: checks[k].actual, expected: checks[k].expected, message: entry.label + ' - ' + checks[k].label,
            });
          }
        }
        dispose();
        done();
      };
      current = document.createElement('iframe');
      current.src = BASE + entry.frame;
      document.body.appendChild(current);
    });
  }

  for (i = 0; i < FRAMES.length; i++) define(FRAMES[i]);
}());
