'use strict';
// The browser leg's program: one QUnit test per cell, driven by `tests/karma/e2e-libs.mjs`. Each
// check becomes its own pushResult, so a red run names the check rather than the bundle, and an
// empty `checks` fails explicitly instead of passing as a test with zero assertions. Karma's summary
// on a green run is only "Executed N of N", which is why the console line reports the count per cell.
(function () {
  var CELL = window.E2E_CELL;
  var LABEL = CELL.label;
  var EXPECTED = CELL.expected;

  QUnit.test(LABEL, function (assert) {
    assert.timeout(CELL.timeout);
    var done = assert.async();
    // a compatibility mode is the one engine this leg must refuse
    var mode = window.e2eCompatibilityMode();
    assert.ok(mode === undefined, LABEL + ': expected standards mode, got documentMode=' + mode);

    function report(checks) {
      var passed = 0,
          i;
      for (i = 0; i < checks.length; i++) if (checks[i].pass) passed++;
      if (window.console && window.console.log) {
        window.console.log('[e2e-libs] ' + LABEL + ': ' + passed + '/' + checks.length + ' checks passed');
      }
      // an exercise reporting FEWER checks here than in node must not pass on the ones it did report.
      // EXPECTED is always non-empty, since runtime.mjs refuses a zero-length pre-flight result
      assert.strictEqual(checks.length, EXPECTED.length, LABEL + ': check count differs from the node pre-flight');
      // the same COUNT under different labels is a different run: a branch that stopped executing and
      // another that started cancel out in the count alone
      var drift = window.e2eLabelDrift(checks, EXPECTED);
      assert.strictEqual(drift, -1, drift === -1 ? LABEL + ': check labels match the node pre-flight'
        : LABEL + ': check ' + drift + ' is "' + checks[drift].label + '" here, "' + EXPECTED[drift] + '" in the node pre-flight');
      for (i = 0; i < checks.length; i++) {
        var check = checks[i];
        assert.pushResult({ result: !!check.pass, actual: check.actual, expected: check.expected, message: LABEL + ' - ' + check.label });
      }
      done();
    }

    function fail(err) {
      assert.ok(false, LABEL + ': run() threw - ' + window.e2eReason(err));
      done();
    }

    window.e2eRun(report, fail);
  });
}());
