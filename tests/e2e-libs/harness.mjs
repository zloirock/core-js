// The in-page harness that reruns an exercise's checks in the TARGET engine (real IE11), as a
// hand-written ES5 program so `assertES5` can parse it. A single arrow function slipping into either
// target is a SyntaxError in IE11 — the one engine a real result ever comes from — and nothing else
// would notice: the node pre-flight runs in a modern realm. Both targets are parsed as ES5 at load
// (the two `assertES5` calls at the bottom).
//
// Two render targets over one run()-scaffold:
//   - banner: paints a green/red banner + a checks table into a standalone HTML page — the artifact
//     uploaded manually to BrowserStack/SauceLabs (see artifacts.mjs).
//   - qunit:  reports each check as a QUnit assertion, for the automated Karma/IE11 run in CI (see
//     karma-bundles.mjs). QUnit here is the qunit@1 fork the repo already drives in IE11, which has
//     `assert.async()` and `assert.pushResult` (used by the existing e2e-usage-pure IE tests).
//
// E2E.run() may return a Promise (rxjs) or a plain result (three), and must not assume a global
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

// One QUnit test per bundle. `label` names the cell (e.g. `rxjs/usage-pure`). Each check becomes a
// pushResult so its own actual/expected show up in the Karma log; an empty `checks` fails explicitly
// (an exercise that silently stopped reporting must not pass as a green test with zero assertions).
export function qunitHarness(label) {
  return `
    QUnit.test(${ JSON.stringify(label) }, function (assert) {
      var done = assert.async();
      function report(res) {
        var checks = (res && res.checks) || [];
        assert.ok(checks.length > 0, 'exercise produced checks');
        for (var i = 0; i < checks.length; i++) {
          var c = checks[i];
          assert.pushResult({ result: !!c.pass, actual: c.actual, expected: c.expected, message: c.label });
        }
        done();
      }
      function fail(err) {
        assert.ok(false, 'run() threw: ' + (err && err.message ? err.message : err));
        done();
      }
      try {
        var res = E2E.run();
        if (res && typeof res.then === 'function') res.then(report)['catch'](fail);
        else report(res);
      } catch (err) { fail(err); }
    });
`;
}

// Parse both targets as ES5 at load — one representative instantiation each is enough, since the
// only per-instance variation is a baked-in number / string literal, which this parse still covers.
assertES5(bannerHarness(0), 'banner harness');
assertES5(qunitHarness('x'), 'qunit harness');
