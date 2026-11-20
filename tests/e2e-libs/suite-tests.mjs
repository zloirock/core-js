import { deepEqual, rejects, strictEqual, throws } from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { runInNewContext } from 'node:vm';
import { assertES5 } from '../../scripts/assert-es5.mjs';
import { closeRollupBundle, makeStrictWarn } from '../transpiler-integration/warning-policy.mjs';
import { deepEqual as exerciseEqual } from './exercises/checks.mjs';
import { reconcileRows } from './manifest.mjs';
import { cellScript } from './page.mjs';
import { HERE, ROOT } from './paths.mjs';
import { assertWorkspacePayload } from './payload.mjs';

const sparse = [];
sparse.length = 2;
strictEqual(exerciseEqual(sparse, ['a', 'b']), false);
strictEqual(exerciseEqual(['a', 'b'], sparse), false);
strictEqual(exerciseEqual(sparse, sparse.slice()), true);
strictEqual(exerciseEqual(sparse, [undefined, undefined]), false);

const { hasOwn } = Object;
try {
  Object.hasOwn = () => false;
  strictEqual(exerciseEqual([1], [2]), false);
  strictEqual(exerciseEqual(sparse, ['a', 'b']), false);
} finally {
  Object.hasOwn = hasOwn;
}

const { isNaN } = Number;
try {
  Number.isNaN = () => true;
  strictEqual(exerciseEqual(1, 2), false);
  strictEqual(exerciseEqual(NaN, NaN), true);
  strictEqual(exerciseEqual(NaN, null), false);
} finally {
  Number.isNaN = isNaN;
}

const first = { label: 'first' };
const second = { label: 'second' };
const cells = [first, second];
deepEqual(reconcileRows(cells, [second, first]), cells);
throws(() => reconcileRows(cells, [first]), /expected 2 cell results/u);
throws(() => reconcileRows(cells, [first, first]), /1 unique/u);
throws(() => reconcileRows(cells, [first, { label: 'unrequested' }]), /missing result for second/u);

const legacy = join(HERE, 'node_modules', 'core-js-pure', 'modules', 'es.array.map.js');
const pure = join(ROOT, 'packages', 'core-js-pure', 'modules', 'es.array.map.js');
const global = join(ROOT, 'packages', 'core-js', 'modules', 'es.array.map.js');
const chunk = { modules: { [legacy]: { renderedLength: 199_000 }, [pure]: { renderedLength: 2_000 } } };
throws(() => assertWorkspacePayload({ chunk }, 'XRegExp'), /only 2000b of workspace core-js/u);
chunk.modules[global] = { renderedLength: 8_000 };
assertWorkspacePayload({ chunk }, 'XRegExp');

const warn = makeStrictWarn('core-js-unplugin');
const sibling = { code: 'PLUGIN_WARNING', plugin: 'core-js-unplugin-helper', message: 'sibling warning' };
let forwarded;
warn(sibling, warning => { forwarded = warning; });
strictEqual(forwarded, sibling);
for (const plugin of ['core-js-unplugin', 'core-js-unplugin:post']) {
  throws(() => warn({ ...sibling, plugin }), /sibling warning/u);
}

const { warn: logWarning } = console;
const warnings = [];
try {
  console.warn = message => warnings.push(message);
  await rejects(async () => {
    try {
      throw new Error('generation failed');
    } finally {
      await closeRollupBundle({ async close() { throw new Error('cleanup failed'); } });
    }
  }, /generation failed/u);
} finally {
  console.warn = logWarning;
}
deepEqual(warnings, ['could not close Rollup bundle: cleanup failed']);

const label = '\u2028\u2029</script>';
const script = cellScript(label, [label]);
assertES5(script, 'generated cell script');
const window = {};
runInNewContext(script, { window });
strictEqual(window.E2E_CELL.label, label);
strictEqual(window.E2E_CELL.expected[0], label);
strictEqual(script.includes('</script>'), false);

const browserPrograms = (await Promise.all(['trap.js', 'shared.js']
  .map(name => readFile(join(HERE, 'harness', name), 'utf8')))).join('\n');
const E2E = { run: () => ({ checks: { length: 1 } }) };
runInNewContext(browserPrograms, { window, E2E });
function browserRun() {
  return new Promise((resolve, reject) => window.e2eRun(resolve, reject));
}
await rejects(browserRun, /did not return a checks array/u);
E2E.run = () => ({ checks: sparse });
await rejects(browserRun, /malformed check at index 0/u);
const valid = [{ label: 'working', pass: true }];
E2E.run = () => ({ checks: valid });
strictEqual(await browserRun(), valid);
E2E.run = async () => {
  window.onerror('uncaught in frame', 'bundle.js', 20);
  return { checks: valid };
};
await rejects(browserRun, /uncaught in frame/u);

// A child makes lingering handles observable without leaving them in the raw tier.
const strippedModule = new URL('./stripped-realm.mjs', import.meta.url).href;
const probe = `
  import { deepEqual, match } from 'node:assert/strict';
  import { strippedLeg } from ${ JSON.stringify(strippedModule) };
  const expected = [{ label: 'ok' }];
  const run = code => strippedLeg(code, 'probe', expected, 100);
  match((await run('for (;;) {}')).reason, /load exceeded/);
  match((await run('this.E2E = {run: function () { for (;;) {} }}')).reason, /run\\(\\) exceeded/);
  const valid = 'this.E2E = {run: function () { return {then: function (resolve) {'
    + 'setInterval(function () {}, 60000); setTimeout(function () { resolve({checks:[{label:"ok",pass:true}]}); }, 0);'
    + '}}; }}';
  deepEqual(await run(valid), { ok: true, count: 1 });
  const late = 'this.E2E={run:function(){function later(n){'
    + 'if(n)queueMicrotask(function(){later(n-1);});else setInterval(function(){},60000);'
    + '}later(25);return {checks:[{label:"ok",pass:true}]};}}';
  deepEqual(await run(late), { ok: true, count: 1 });
  const latePromise = 'this.E2E={run:function(){'
    + '(async function () { for (var i = 0; i < 25; i++) await 0; setInterval(function () {}, 60000); })();'
    + 'return {checks:[{label:"ok",pass:true}]};}}';
  deepEqual(await run(latePromise), { ok: true, count: 1 });
  // A raw Promise read would succeed in the pre-flight, but the stripped realm removes it.
  for (const schedule of ['setTimeout', 'setInterval', 'queueMicrotask']) {
    const broken = 'this.E2E={run:function(){return {then:function(){'
      + schedule + '(function(){Promise.resolve();},0);'
      + '}};}}';
    match((await run(broken)).reason, /Promise is not defined/);
  }
  deepEqual(await run(valid), { ok: true, count: 1 });
`;
await promisify(execFile)(process.execPath, ['--input-type=module', '-e', probe], { timeout: 5_000 });
