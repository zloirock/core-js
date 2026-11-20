// Observed on real IE11. A different assertion or another browser still fails the cell.
const iterableHelp = '\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.';
const spread = `Invalid attempt to spread non-iterable instance.${ iterableHelp }`;
const iterate = `Invalid attempt to iterate non-iterable instance.${ iterableHelp }`;
const weakSet = /^'WeakSet' is undefined(?: \(.+:\d+\))?$/u;
const symbol = /^'Symbol' is undefined(?: \(.+:\d+\))?$/u;
// ES5 match() does not call the exec() where Babel implements named groups.
const colorjs = /^Unable to get property 'type' of undefined or null reference$/u;
// Without Symbol, lodash-es recognizes neither the tag nor the constructor of a pure Map.
const lodash = /^Incompatible receiver, Map required$/u;

const IE11_ERRORS = new Map([
  ['three/unplugin/usage-pure/pre', spread],
  ['ml-matrix/unplugin/usage-pure/pre', symbol],
  ['colorjs/babel-plugin/usage-pure', colorjs],
  ['colorjs/unplugin/usage-pure/pre', spread],
  ['colorjs/unplugin/usage-pure/post', colorjs],
  ['colorjs/unplugin/usage-pure/pre+post', colorjs],
  ['d3-scale/unplugin/usage-pure/pre', iterate],
  ['graphql/unplugin/usage-pure/pre', iterate],
  ['kysely/unplugin/usage-pure/pre', weakSet],
  ['liquidjs/unplugin/usage-pure/pre', /^Object doesn't support property or method 'from', line:1, col:1$/u],
  ['ical/unplugin/usage-pure/pre', spread],
  ['minimatch/unplugin/usage-pure/pre', weakSet],
  ['immutable/unplugin/usage-pure/pre', iterate],
  ['lodash/babel-plugin/usage-pure', lodash],
  ['lodash/unplugin/usage-pure/pre', symbol],
  ['lodash/unplugin/usage-pure/post', lodash],
  ['lodash/unplugin/usage-pure/pre+post', lodash],
]);

export function isExpectedFailure({ browser, label, log }) {
  if (!/^IE 11\.0 \(/u.test(browser) || log?.length !== 1) return false;
  const prefix = `${ label }: run() threw - `;
  // The adapter appends the failed assert.ok() details after the entire message, including newlines.
  const [assertion] = log;
  const end = assertion.lastIndexOf('\nExpected: true\nActual: false\n');
  if (end === -1 || !assertion.startsWith(prefix)) return false;
  const reason = assertion.slice(prefix.length, end);
  const known = IE11_ERRORS.get(label);
  return typeof known === 'string' ? reason === known : known?.test(reason) === true;
}
