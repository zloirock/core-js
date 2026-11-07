import { run } from './helpers.mjs';
import platforms from './platforms.mjs';
import allPlatforms from './all-platforms.mjs';

const { cyan } = chalk;

// dumped values and error messages span lines
function indent(text, prefix) {
  return text.replaceAll(/^/gm, prefix);
}

// the results of `tests/unit-browser/qunit-results.js`
function evaluate({ done, failed, total, failures }) {
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
  const passed = failed === 0;
  return { passed, summary: passed ? `${ cyan(total) } assertions passed` : `${ failed } of ${ total } assertions failed`, details };
}

await run({
  name: 'unit',
  pages: [
    'unit-browser/global.html',
    'unit-browser/pure.html',
    // the e2e legs karma runs in browsers
    'unit-browser/usage-pure-babel.html',
    'unit-browser/usage-pure-unplugin-pre-post.html',
  ],
  platforms: argv.all ? await allPlatforms(process.env.SAUCE_REGION || 'us-west-1') : platforms,
  concurrency: 10,
  reporter: 'qunitResults',
  evaluate,
});
