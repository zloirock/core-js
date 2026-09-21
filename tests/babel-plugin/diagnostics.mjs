// Unit tests for the babel leg's two diagnostic channels. The debug report is read off the
// injector once the file is done, so it lists the emission - what the output carries after every
// dedup and prune - and the oracle here is the output's own import set, not a remembered list. An
// error leaving a lifecycle handler carries the brand once, and the file once: babel names the
// file itself (`<filename>: ` on every error leaving pre / traverse / post), so a file tag of our
// own printed the path twice.
// BABEL_REQUIRE_FROM mirrors the fixture runner's hook so the suite runs under babel@8 (default)
// and babel@7 (with BABEL_REQUIRE_FROM=../babel-plugin-v7) alike. the transforms are SYNCHRONOUS on
// purpose: the report is captured off `console.log`, and a sibling suite hijacks the same channel
// under a top-level await - sibling modules interleave there, so an async window here would swap
// the two captures
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { captureLogs, importedPolyfills, reportCount, reportedPolyfills } from '../polyfill-provider/debug-report.mjs';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformSync } = requireBabel('@babel/core');

const { check, checkDeep, checkTruthy, finish } = createChecker('diagnostics');

const PLUGIN = '../../packages/core-js-babel-plugin/index.js';

// `filename: null` runs babel without one, the documented `transformSync(code, { plugins })` shape
function transform(code, options, filename = 'input.mjs') {
  // eslint-disable-next-line node/no-sync -- synchronous on purpose, see the header
  const { result, logs } = captureLogs(() => transformSync(code, {
    configFile: false,
    babelrc: false,
    filename: filename ?? undefined,
    sourceType: 'module',
    plugins: [[PLUGIN, { version: '4.0', targets: { ie: 11 }, debug: true, ...options }]],
  }).code);
  return { out: result, logs };
}

// usage-pure: the entries behind the minted bindings, exactly the ones printed
{
  const { out, logs } = transform('export const a = [1].at(0);\nexport const b = Array.from([]);\n', { method: 'usage-pure' });
  check('debug report/usage-pure: one report per file', reportCount(logs), 1);
  checkDeep('debug report/usage-pure: lists exactly the emitted entries', reportedPolyfills(logs), importedPolyfills(out));
  checkTruthy('debug report/usage-pure: the emission is non-empty', importedPolyfills(out).length > 0);
}

// usage-global: the modules the file's usage pulled in; a core-js import the user wrote stays
// theirs - kept as written, it is no emission of ours and is not reported as one
{
  const { out, logs } = transform("import 'core-js/actual/array/at';\nexport const p = Promise.resolve(1);\n", { method: 'usage-global' });
  check('debug report/usage-global: one report per file', reportCount(logs), 1);
  checkDeep('debug report/usage-global: lists exactly the emitted modules', reportedPolyfills(logs), importedPolyfills(out));
  checkTruthy('debug report/usage-global: the emission is non-empty', importedPolyfills(out).length > 0);
  checkTruthy("debug report/usage-global: the user's own import is kept and not reported",
    out.includes("'core-js/actual/array/at'") && !reportedPolyfills(logs).includes('es.array.at'));
}

// a file that emits nothing says so, and says it once
{
  const { logs } = transform('export const n = 1;\n', { method: 'usage-global' });
  check('debug report/nothing emitted: one report', reportCount(logs), 1);
  checkTruthy('debug report/nothing emitted: says so', logs[0].includes('did not add any polyfill'));
}

// entry-global: the report lists the modules the entry became, after the surgery; a file without
// an entry says so instead of listing an empty emission
{
  const { out, logs } = transform("import 'core-js/actual/array/at';\nexport const p = [1].at(0);\n", { method: 'entry-global' });
  check('debug report/entry-global: one report per file', reportCount(logs), 1);
  checkDeep('debug report/entry-global: lists exactly the modules the entry became', reportedPolyfills(logs), importedPolyfills(out));
  checkTruthy('debug report/entry-global: the entry became modules', importedPolyfills(out).includes('es.array.at'));
  const absent = transform('export const p = [1].at(0);\n', { method: 'entry-global' });
  check('debug report/entry-global without an entry: one report', reportCount(absent.logs), 1);
  check('debug report/entry-global without an entry: says so', reportedPolyfills(absent.logs), 'The entry point for the core-js@4 polyfill has not been found.');
}

// an error thrown inside the transform: one brand, one file, in babel's own order. the throw is a
// user callback's, so it arrives already branded by the provider's wrapper - the lifecycle wrapper
// must not brand it again, and must not name the file babel is about to name
{
  let message = null;
  try {
    transform('export const a = [1].at(0);\n', { method: 'usage-global', shouldInjectPolyfill: () => { throw new Error('callback-boom'); } });
  } catch (error) {
    message = error.message;
  }
  checkTruthy('error brand/the transform failed', message !== null);
  check('error brand/exactly one brand', message?.split('[core-js]').length, 2);
  check('error brand/exactly one file identity', message?.split('input.mjs').length, 2);
  // babel spells the file as it resolved it (an absolute path - on Windows with a drive colon in
  // it, so the head is "anything but a newline"), then our brand, then the message
  checkTruthy('error brand/babel names the file, the brand follows', /^[^\n]*input\.mjs: \[core-js\] shouldInjectPolyfill/.test(message ?? ''));
  checkTruthy('error brand/the cause survives', message?.includes('callback-boom'));
}

// the same without a filename: babel writes `unknown file:` and the brand stays the one signal
{
  let message = null;
  try {
    transform('export const a = [1].at(0);\n', { method: 'usage-global', shouldInjectPolyfill: () => { throw new Error('callback-boom'); } }, null);
  } catch (error) {
    message = error.message;
  }
  check('error brand/no filename: exactly one brand', message?.split('[core-js]').length, 2);
  checkTruthy('error brand/no filename: babel writes unknown file, the brand follows', message?.startsWith('unknown file: [core-js] '));
}

finish();
