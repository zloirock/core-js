// The in-page harness that reruns an exercise's checks in the TARGET engine, as a hand-written ES5
// program: a single arrow function slipping in is a SyntaxError in IE11 and nothing else would notice,
// since the node pre-flight runs in a modern realm. Both targets are parsed by `assertES5` at load.
//
// `E2E.run()` may return a promise or a plain result, and must not assume a global `Promise` -
// `usage-pure` does not patch one - so both targets branch on a thenable rather than adopting it.
//
// TWO RULES BIND EVERYTHING BELOW.
//
// 1. Nothing here may call a method the bundle under test can REPLACE. core-js substitutes
//    `Array.prototype.filter` on this target - `forced` is `!arrayMethodHasSpeciesSupport('filter')`,
//    and the compat data gives `es.array.filter` to no version of `ie` - so a harness computing its
//    verdict with it counts failures using the code it is checking, and a substituted one returning
//    `[]` reads as "nothing failed". Index loops and `+` throughout; `String`, property reads and
//    `document` are what is left. `push` is replaced too and `join` is not, and neither is worth an
//    exception: the rule is only useful if it has none. The one call it cannot avoid is `then` on
//    what `E2E.run()` returned - that is how the result arrives at all, and this target has no native
//    `Promise`, so it comes out of the bundle. Its REJECTION handler is passed to that same `then`
//    rather than taken from a following `.catch`: a second replaced method on the path, and one whose
//    failure would hold a rejected run until the budget below and report it as never having settled.
//
// 2. The two targets are one instrument and carry the same guards - engine identity, the label
//    sequence, a time budget. The banner is what CI publishes as an artifact when the job fails,
//    which is exactly when someone opens it, so it may not be the weaker of the two.

import { assertES5 } from './build.mjs';
import { ES5_REASON_SOURCE } from './diagnostics.mjs';

// The markup the page targets address, in ONE place. The page is rendered by `runtime.mjs` and
// addressed here, so a literal on each side has nothing tying it to the other: renaming an id in the
// renderer would leave this file addressing an element that does not exist.
//
// The "running..." state has no class of its own: the banner carries that colour itself, so the two
// state classes here are all a target sets on it, and a third would be one no stylesheet defines.
export const PAGE = {
  banner: 'banner',
  table: 'tbl',
  pass: 'green',
  fail: 'red',
};

// ONE budget, both targets. A `run()` that never settles is the one failure this realm can produce and
// the node pre-flight cannot, `Promise` being native there and the polyfill under test here.
//
// Ordered UNDER karma's `browserNoActivityTimeout`, which `karma.conf.cjs` pins for this: QUnit sets
// none of its own, so without one the page falls silent until karma reports a DISCONNECT, which reads
// as a browser problem rather than as a broken polyfill. The banner page has neither behind it and
// would simply stay on the state it starts in.
const RUN_TIMEOUT_MS = 20_000;

// `expectedLabels` is the node pre-flight's label SEQUENCE, baked in. Not its count: the same count
// under different labels is a different run - a branch that stopped executing and another that started
// cancel out in a count - and that is the comparison the QUnit target has always made.
export function bannerHarness(expectedLabels) {
  return `
    (function () {
      // the sequence is baked as the joined STRING, not as an array to join here: this program may
      // not call a method the bundle can replace, and joining at generation time needs none
      var EXPECTED = ${ JSON.stringify(expectedLabels.join('|')) };
      var EXPECTED_COUNT = ${ expectedLabels.length };
      var BANNER = ${ JSON.stringify(PAGE.banner) };
      var TABLE = ${ JSON.stringify(PAGE.table) };
      var PASS = ${ JSON.stringify(PAGE.pass) };
      var FAIL = ${ JSON.stringify(PAGE.fail) };
      var settled = false;

      // the element is not assumed to exist: on a page whose markup has moved, an error path that
      // read it first would throw from the very handler that is there to report a throw
      function paint(state, text) {
        var element = document.getElementById(BANNER);
        if (!element) return;
        element.className = state;
        element.textContent = text;
      }

      // guarded like the banner above, and read through one function by every caller: a table whose
      // id has moved would otherwise throw from the error path that is there to report a throw, and
      // on the success path it would throw after the banner was painted, where the catch below is
      // already latched shut
      function tbodyOf() {
        var table = document.getElementById(TABLE);
        return table && table.getElementsByTagName('tbody')[0];
      }

      // The table is rendered from node's results, so it is a statement about the PRE-FLIGHT until
      // this browser produces its own. Left standing on an early exit it says FAIL above a table of
      // green rows, which reads as though the checks had passed here.
      function tableSays(text) {
        var tbody = tbodyOf();
        if (!tbody) return;
        tbody.innerHTML = '';
        var row = document.createElement('tr');
        var cell = document.createElement('td');
        cell.colSpan = 2;
        cell.textContent = text;
        row.appendChild(cell);
        tbody.appendChild(row);
      }

      function labelsOf(checks) {
        var out = '', i;
        for (i = 0; i < checks.length; i++) out += (i ? '|' : '') + checks[i].label;
        return out;
      }

      function render(res) {
        if (settled) return;
        settled = true;
        // the same guarantee the QUnit target asserts first: only IE exposes documentMode, and 11
        // exactly, since its compatibility modes report 5 through 10 and serve a DIFFERENT set of
        // natives. A green page in another engine is a claim about a floor this page never touched
        var documentMode = window.document && document.documentMode;
        if (documentMode !== 11) {
          paint(FAIL, 'NOT IE11 - documentMode=' + documentMode + '. These checks ran, but not on the floor this page is for.');
          tableSays('the rows above are the node pre-flight; this browser is not the target engine');
          return;
        }
        var checks = (res && res.checks) || [];
        if (labelsOf(checks) !== EXPECTED) {
          // an equal count under different labels is its own sentence: reporting two identical
          // numbers reads as a runner that cannot tell what it is complaining about
          paint(FAIL, checks.length === EXPECTED_COUNT
            ? 'FAIL - ' + checks.length + ' checks, as many as the node pre-flight, but not the same ones'
            : 'FAIL - got ' + checks.length + ' checks, the node pre-flight recorded ' + EXPECTED_COUNT);
          tableSays('the rows above are the node pre-flight, which this browser did not reproduce');
          return;
        }
        var bad = 0, i;
        for (i = 0; i < checks.length; i++) if (!checks[i].pass) bad++;
        var text = bad
          ? ('FAIL - ' + bad + '/' + checks.length + ' checks failed in this IE11')
          : ('PASS - all ' + checks.length + ' checks green in this IE11');
        var tbody = tbodyOf();
        // the verdict is the banner's and is painted either way; the rows under it are the node
        // pre-flight's until this browser replaces them, so a table this page cannot find leaves
        // that verdict standing over someone else's results, and says so rather than exiting quiet
        if (!tbody) {
          paint(bad ? FAIL : PASS, text + ' - results table missing, the rows below are the node pre-flight');
          return;
        }
        paint(bad ? FAIL : PASS, text);
        tbody.innerHTML = '';
        for (i = 0; i < checks.length; i++) {
          var row = document.createElement('tr');
          row.className = checks[i].pass ? 'ok' : 'bad';
          var name = document.createElement('td');
          name.textContent = checks[i].label;
          var result = document.createElement('td');
          result.textContent = checks[i].pass ? 'PASS' : 'FAIL';
          row.appendChild(name);
          row.appendChild(result);
          tbody.appendChild(row);
        }
      }
${ ES5_REASON_SOURCE }
      function showError(err) {
        if (settled) return;
        settled = true;
        paint(FAIL, 'ERROR - ' + e2eReason(err));
        tableSays('the rows above are the node pre-flight; this browser did not finish');
      }

      setTimeout(function () {
        if (settled) return;
        settled = true;
        paint(FAIL, 'FAIL - run() did not settle within ${ RUN_TIMEOUT_MS }ms in this browser');
        tableSays('the rows above are the node pre-flight; this browser never finished the run');
      }, ${ RUN_TIMEOUT_MS });

      try {
        var res = E2E.run();
        if (res && typeof res.then === 'function') res.then(render, showError);
        else render(res);
      } catch (err) { showError(err); }
    })();
`;
}

// Each check becomes its own pushResult, so a red run names the check rather than the bundle, and an
// empty `checks` fails explicitly instead of passing as a test with zero assertions. Karma's summary
// on a green run is only "Executed N of N", which is why the console line reports the count per cell -
// karma.conf.cjs forwards it to the terminal.
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
        // 11 exactly, not merely set: IE's compatibility modes report 5 through 10 and serve a
        // DIFFERENT set of natives, so a page rendered in one would be measuring another engine
        var documentMode = window.document && document.documentMode;
        assert.strictEqual(documentMode, 11, LABEL + ': expected real IE11 in standards mode, got documentMode=' + documentMode);
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
          // built by concatenation rather than with push and join, under rule 1 in the header: a
          // harness computing its verdict with the code under test is measuring itself
          var labels = '', expected = '', j;
          for (i = 0; i < checks.length; i++) labels += (i ? '|' : '') + checks[i].label;
          for (j = 0; j < EXPECTED.length; j++) expected += (j ? '|' : '') + EXPECTED[j];
          assert.strictEqual(labels, expected, LABEL + ': check labels differ from the node pre-flight');
          for (i = 0; i < checks.length; i++) {
            var check = checks[i];
            assert.pushResult({ result: !!check.pass, actual: check.actual, expected: check.expected, message: LABEL + ' - ' + check.label });
          }
          done();
        }
${ ES5_REASON_SOURCE }
        function fail(err) {
          assert.ok(false, LABEL + ': run() threw - ' + e2eReason(err));
          done();
        }
        try {
          var res = E2E.run();
          if (res && typeof res.then === 'function') res.then(report, fail);
          else report(res);
        } catch (err) { fail(err); }
      });
    })();
`;
}

// Parse both targets as ES5 at load - one representative instantiation each is enough, since the only
// per-instance variation is a baked-in literal, which this parse still covers.
assertES5(bannerHarness(['a']), 'banner harness');
assertES5(qunitHarness('x', ['a']), 'qunit harness');
