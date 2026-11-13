// dumped values and error messages span lines
function indent(text, prefix) {
  return text.replaceAll(/^/gm, prefix);
}

// the results of `tests/unit-browser/qunit-results.js`
export function evaluate({ done, failed, total, failures }, cyan = value => value) {
  // QUnit 1 ends a run without tests as a pass, and that is what a page whose bundle did not load runs
  if (done && !total) return { passed: false, summary: 'no assertions ran', details: [] };
  const details = [];
  for (const { module, test, message, expected, actual } of failures) {
    // most tests sit outside any QUnit module
    details.push(indent(`${ module ? `${ module } > ` : '' }${ test }: ${ message }`, '    '));
    if (expected !== undefined) details.push(indent(`expected: ${ expected }\nactual: ${ actual }`, '      '));
  }
  // a run that never ended has no total of failures yet
  if (done && failed > failures.length) details.push(`    and ${ failed - failures.length } more`);
  const failureCount = Math.max(failed, failures.length);
  const passed = failureCount === 0;
  return { passed, summary: passed ? `${ cyan(total) } assertions passed` : `${ failureCount } of ${ total } assertions failed`, details };
}
