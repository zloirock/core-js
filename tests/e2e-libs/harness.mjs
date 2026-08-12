// The in-page harness that reruns an exercise's checks in the TARGET engine, as a hand-written ES5
// program: a single arrow function slipping in is a SyntaxError in IE11 and nothing else would notice,
// since the node pre-flight runs in a modern realm. Both targets are parsed by `assertES5` at load.
//
// `E2E.run()` may return a promise or a plain result, and must not assume a global `Promise` -
// `usage-pure` does not patch one - so both targets branch on a thenable rather than adopting it.

import { assertES5 } from './build.mjs';

// `expected` is the node pre-flight count, baked in so an exercise returning fewer checks in-browser
// than it did in node cannot paint the page green.
export function bannerHarness(expected) {
  return `
    var EXPECTED = ${ expected };
    function render(res) {
      var checks = (res && res.checks) || [], bad = checks.filter(function (c) { return !c.pass; });
      var b = document.getElementById('banner');
      if (checks.length !== EXPECTED) {
        b.className = 'red';
        b.textContent = 'FAIL - got ' + checks.length + ' checks, pre-flight recorded ' + EXPECTED;
        return;
      }
      b.className = bad.length ? 'red' : 'green';
      b.textContent = bad.length ? ('FAIL - ' + bad.length + '/' + checks.length + ' checks failed') : ('PASS - all ' + checks.length + ' checks green in this browser');
      var tbody = document.querySelector('#tbl tbody');
      tbody.innerHTML = '';
      checks.forEach(function (c) {
        var tr = document.createElement('tr');
        tr.className = c.pass ? 'ok' : 'bad';
        var name = document.createElement('td');
        name.textContent = c.label;
        var result = document.createElement('td');
        result.textContent = c.pass ? 'PASS' : 'FAIL';
        tr.appendChild(name);
        tr.appendChild(result);
        tbody.appendChild(tr);
      });
    }
    function showError(err) {
      var b = document.getElementById('banner');
      b.className = 'red';
      b.textContent = 'ERROR - ' + (err && err.message ? err.message : err);
    }
    try {
      var res = E2E.run();
      if (res && typeof res.then === 'function') res.then(render).catch(showError);
      else render(res);
    } catch (err) { showError(err); }
`;
}

// Each check becomes its own pushResult, so a red run names the check rather than the bundle, and an
// empty `checks` fails explicitly instead of passing as a test with zero assertions. Karma's summary
// on a green run is only "Executed N of N", which is why the console line reports the count per cell -
// karma.conf.cjs forwards it to the terminal.

// A `run()` that never settles is the one failure this realm can produce and the node pre-flight
// cannot: there `Promise` is native, here it is the polyfill under test. QUnit 2 sets no timeout of
// its own - past 3s it only warns - so without this the page falls silent until karma's
// `browserNoActivityTimeout` (30s by default) reports a disconnect, which reads as a browser or
// network problem rather than as a broken polyfill. Kept under that default so QUnit is the one to
// speak first, and far above any real run: the exercises are deterministic and small.
const RUN_TIMEOUT_MS = 20_000;

export function qunitHarness(label, expectedLabels) {
  return `
    (function () {
      var LABEL = ${ JSON.stringify(label) };
      var EXPECTED = ${ JSON.stringify(expectedLabels) };
      QUnit.test(LABEL, function (assert) {
        assert.timeout(${ RUN_TIMEOUT_MS });
        var done = assert.async();
        // fail loudly if this is NOT real IE11: on a modern engine (e.g. an iexplore -> Edge redirect
        // on the CI runner) the natives are present, so a missed usage-pure rewrite would resolve and
        // pass green - the exact modern-realm blind spot this leg exists to eliminate. Only IE exposes
        // document.documentMode (11 in standards mode); Edge/Chromium do not.
        var dm = window.document && document.documentMode;
        assert.ok(!!dm, LABEL + ': expected real IE11 (document.documentMode set), got documentMode=' + dm);
        function report(res) {
          var checks = (res && res.checks) || [];
          var passed = 0, i;
          for (i = 0; i < checks.length; i++) if (checks[i].pass) passed++;
          if (window.console && window.console.log) {
            window.console.log('[e2e-libs] ' + LABEL + ': ' + passed + '/' + checks.length + ' checks passed in this IE11');
          }
          // an exercise reporting FEWER checks here than in node must not pass on the ones it did
          // report. EXPECTED is always non-empty, since runtime.mjs refuses a zero-length pre-flight
          // result. (No backticks in this block - it lives inside a template literal.)
          assert.strictEqual(checks.length, EXPECTED.length, LABEL + ': check count differs from the node pre-flight');
          // and the same COUNT under different labels is a different run: a branch that stopped
          // executing and another that started would cancel out in the count alone
          var labels = [];
          for (i = 0; i < checks.length; i++) labels.push(checks[i].label);
          assert.strictEqual(labels.join('|'), EXPECTED.join('|'), LABEL + ': check labels differ from the node pre-flight');
          for (i = 0; i < checks.length; i++) {
            var c = checks[i];
            assert.pushResult({ result: !!c.pass, actual: c.actual, expected: c.expected, message: LABEL + ' - ' + c.label });
          }
          done();
        }
        function fail(err) {
          assert.ok(false, LABEL + ': run() threw - ' + (err && err.message ? err.message : err));
          done();
        }
        try {
          var res = E2E.run();
          if (res && typeof res.then === 'function') res.then(report)['catch'](fail);
          else report(res);
        } catch (err) { fail(err); }
      });
    })();
`;
}

// Parse both targets as ES5 at load - one representative instantiation each is enough, since the only
// per-instance variation is a baked-in literal, which this parse still covers.
assertES5(bannerHarness(0), 'banner harness');
assertES5(qunitHarness('x', ['a']), 'qunit harness');
