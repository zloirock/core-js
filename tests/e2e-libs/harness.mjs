// The in-page harness that reruns an exercise's checks in the TARGET engine (real IE11), as a
// hand-written ES5 program so `assertES5` can parse it. A single arrow function slipping into either
// target is a SyntaxError in IE11 — the one engine a real result ever comes from — and nothing else
// would notice: the node pre-flight runs in a modern realm. Both targets are parsed as ES5 at load
// (the two `assertES5` calls at the bottom).
//
// Two render targets over one run()-scaffold:
//   - banner: paints a green/red banner + a checks table into a standalone HTML page — the artifact
//     uploaded manually to BrowserStack/SauceLabs (see runtime.mjs).
//   - qunit:  reports each check as a QUnit assertion, for the automated Karma/IE11 run in CI (see
//     runtime.mjs). QUnit here is the qunit@2 / karma-qunit@4 stack the repo already drives in
//     IE11 (tests/unit-karma), which has `assert.async()` and `assert.pushResult`.
//
// E2E.run() may return a Promise (rxjs, three) or a plain result (codemirror), and must not assume a global
// Promise (usage-pure doesn't patch it) — so both targets branch on a thenable, never Promise.resolve.
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
        b.textContent = 'FAIL — got ' + checks.length + ' checks, pre-flight recorded ' + EXPECTED;
        return;
      }
      b.className = bad.length ? 'red' : 'green';
      b.textContent = bad.length ? ('FAIL — ' + bad.length + '/' + checks.length + ' checks failed') : ('PASS — all ' + checks.length + ' checks green in this browser');
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
      b.textContent = 'ERROR — ' + (err && err.message ? err.message : err);
    }
    try {
      var res = E2E.run();
      if (res && typeof res.then === 'function') res.then(render).catch(showError);
      else render(res);
    } catch (err) { showError(err); }
`;
}

// One QUnit test per bundle. `label` names the cell (e.g. `rxjs/usage-pure/post`). Each individual
// check becomes its own pushResult — so a red run names the exact check plus its actual/expected — and
// an empty `checks` fails explicitly (an exercise that silently stopped reporting must not pass as a
// green test with zero assertions). On a GREEN run Karma's summary is only "Executed N of N"; the
// console.log line makes the leg self-explanatory in the CI log — how many checks of the exercise
// actually ran in this IE11, per cell — which karma.conf.cjs forwards to the terminal.
//
// runtime.mjs gives each bundle its OWN IE11 page (one bundle per Karma run), so the UMD's `E2E`
// global is unambiguously this cell's — no co-loaded sibling can overwrite it, or patch a global that
// masks another cell's miss. The IIFE just keeps `LABEL` and the helpers out of the page's global scope.
export function qunitHarness(label, expected) {
  return `
    (function () {
      var LABEL = ${ JSON.stringify(label) };
      var EXPECTED = ${ expected };
      QUnit.test(LABEL, function (assert) {
        var done = assert.async();
        // fail loudly if this is NOT real IE11: on a modern engine (e.g. an iexplore -> Edge redirect
        // on the CI runner) the natives are present, so a missed usage-pure rewrite would resolve and
        // pass green — the exact modern-realm blind spot this leg exists to eliminate. Only IE exposes
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
          // the same guard the banner target carries: an exercise that reports FEWER checks in this
          // engine than it did in node must not pass just because the ones it did report were green.
          // This subsumes a "checks.length > 0" assertion: runtime.mjs refuses a zero-length
          // pre-flight result before this file is written, so EXPECTED is always >= 1.
          // (No backticks in this block - it lives inside a template literal.)
          assert.strictEqual(checks.length, EXPECTED, LABEL + ': check count differs from the node pre-flight');
          for (i = 0; i < checks.length; i++) {
            var c = checks[i];
            assert.pushResult({ result: !!c.pass, actual: c.actual, expected: c.expected, message: LABEL + ' — ' + c.label });
          }
          done();
        }
        function fail(err) {
          assert.ok(false, LABEL + ': run() threw — ' + (err && err.message ? err.message : err));
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

// Parse both targets as ES5 at load — one representative instantiation each is enough, since the
// only per-instance variation is a baked-in number / string literal, which this parse still covers.
assertES5(bannerHarness(0), 'banner harness');
assertES5(qunitHarness('x', 0), 'qunit harness');
