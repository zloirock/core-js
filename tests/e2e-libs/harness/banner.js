'use strict';
// The artifact page's program: it reruns the exercise's checks in whatever browser opened the page
// and paints the verdict over the node pre-flight's table.
(function () {
  var CELL = window.E2E_CELL;
  var EXPECTED = CELL.expected;
  var BANNER = CELL.page.banner;
  var TABLE = CELL.page.table;
  var PASS = CELL.page.pass;
  var FAIL = CELL.page.fail;
  var settled = false;

  // the element is not assumed to exist: on a page whose markup has moved, an error path that read
  // it first would throw from the handler that is there to report a throw
  function paint(state, text) {
    var element = document.getElementById(BANNER);
    if (!element) return;
    element.className = state;
    element.textContent = text;
  }

  // guarded like the banner above, and for the same reason
  function tbodyOf() {
    var table = document.getElementById(TABLE);
    return table && table.getElementsByTagName('tbody')[0];
  }

  // the table is node's results until this browser produces its own, so left standing on an early
  // exit it says FAIL above a table of green rows - which reads as though the checks passed here
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

  function render(checks) {
    if (settled) return;
    settled = true;
    var mode = window.e2eCompatibilityMode();
    if (mode !== undefined) {
      paint(FAIL, 'IE compatibility mode - documentMode=' + mode + '. These checks ran, but not on the floor this page is for.');
      tableSays('the rows above are the node pre-flight; this browser is not the target engine');
      return;
    }
    if (checks.length !== EXPECTED.length || window.e2eLabelDrift(checks, EXPECTED) !== -1) {
      // an equal count under different labels is its own sentence: reporting two identical numbers
      // reads as a runner that cannot tell what it is complaining about
      paint(FAIL, checks.length === EXPECTED.length
        ? 'FAIL - ' + checks.length + ' checks, as many as the node pre-flight, but not the same ones'
        : 'FAIL - got ' + checks.length + ' checks, the node pre-flight recorded ' + EXPECTED.length);
      tableSays('the rows above are the node pre-flight, which this browser did not reproduce');
      return;
    }
    var bad = 0,
        i;
    for (i = 0; i < checks.length; i++) if (!checks[i].pass) bad++;
    var text = bad
      ? ('FAIL - ' + bad + '/' + checks.length + ' checks failed in this browser')
      : ('PASS - all ' + checks.length + ' checks green in this browser');
    var tbody = tbodyOf();
    // the verdict is the banner's and is painted either way; the rows under it are the node
    // pre-flight's until this browser replaces them, so a table this page cannot find leaves that
    // verdict standing over someone else's results, and says so rather than exiting quiet
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

  function showError(err) {
    if (settled) return;
    settled = true;
    paint(FAIL, 'ERROR - ' + window.e2eReason(err));
    tableSays('the rows above are the node pre-flight; this browser did not finish');
  }

  setTimeout(function () {
    if (settled) return;
    settled = true;
    paint(FAIL, 'FAIL - run() did not settle within ' + CELL.timeout + 'ms in this browser');
    tableSays('the rows above are the node pre-flight; this browser never finished the run');
  }, CELL.timeout);

  window.e2eRun(render, showError);
}());
