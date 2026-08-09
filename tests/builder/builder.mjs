import { doesNotReject, ok, rejects, strictEqual, throws } from 'node:assert/strict';
import { access, mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { isAbsolute, join } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import builder from '@core-js/builder';
import { getRolldownOptions } from '@core-js/builder/config.js';

const { script } = await builder({
  modules: 'actual',
  exclude: [/group-by/, 'es.typed-array.with'],
  targets: { node: 16 },
  format: 'esm',
});

ok(script.includes("import 'core-js/modules/es.error.cause.js';"), 'actual node 16 #1');
ok(script.includes("import 'core-js/modules/es.array.push.js';"), 'actual node 16 #2');
ok(script.includes("import 'core-js/modules/esnext.iterator.includes.js';"), 'actual node 16 #3');
ok(script.includes("import 'core-js/modules/web.structured-clone.js';"), 'actual node 16 #4');
ok(!script.includes("import 'core-js/modules/es.weak-set.constructor.js';"), 'actual node 16 #5');
ok(!script.includes("import 'core-js/modules/es.typed-array.with.js';"), 'actual node 16 #6');
ok(!script.includes("import 'core-js/modules/es.object.group-by.js';"), 'actual node 16 #7');
ok(!script.includes("import 'core-js/modules/esnext.string.dedent.js';"), 'actual node 16 #8');

// the entry template of a `bundle` build is generated outside of the package, where the usual walk up to
// `node_modules` does not find `core-js` - and an unresolved specifier is not a build error, it turns the
// module into an external import and silently leaves it out of the output
const options = getRolldownOptions('input.js', 'output.js');
const [coreJSLookup] = options.resolve.modules;

ok(isAbsolute(coreJSLookup), 'rolldown options #1');
await doesNotReject(access(join(coreJSLookup, 'core-js/package.json')), 'rolldown options #2');
ok(options.resolve.modules.includes('node_modules'), 'rolldown options #3');
throws(() => options.onLog('warn', { code: 'UNRESOLVED_IMPORT', message: 'dropped module' }, () => {
  throw new Error('delegated instead of failing');
}), /dropped module/, 'rolldown options #4');

let delegated = null;
options.onLog('warn', { code: 'CIRCULAR_DEPENDENCY' }, (level, log) => delegated = log.code);
strictEqual(delegated, 'CIRCULAR_DEPENDENCY', 'rolldown options #5');

// point the OS temporary directory at one the test owns, so both the location of the scratch files and their
// removal are observable - an unreachable one has to break the build, a writable one has to come back empty
const sandbox = await mkdtemp(join(tmpdir(), 'core-js-builder-test-'));
const restore = { TMPDIR: process.env.TMPDIR, TEMP: process.env.TEMP, TMP: process.env.TMP };
const bundleOptions = { modules: ['es.object.group-by', 'es.array.at'], targets: { ie: 11 }, format: 'bundle' };

function redirectTempDirectory(directory) {
  Object.assign(process.env, { TMPDIR: directory, TEMP: directory, TMP: directory });
}

redirectTempDirectory(join(sandbox, 'missing'));

await rejects(builder(bundleOptions), { code: 'ENOENT' }, 'bundle ie 11 #1');

redirectTempDirectory(sandbox);

strictEqual(tmpdir(), sandbox, 'bundle ie 11 #2');

const { script: bundle } = await builder(bundleOptions);
const leftovers = await readdir(sandbox);

for (const [key, value] of Object.entries(restore)) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

await rm(sandbox, { force: true, recursive: true });

const context = createContext({});

runInContext('delete Object.groupBy; delete Array.prototype.at;', context);
runInContext(bundle, context);

strictEqual(runInContext('typeof Object.groupBy', context), 'function', 'bundle ie 11 #3');
strictEqual(runInContext('typeof Array.prototype.at', context), 'function', 'bundle ie 11 #4');
strictEqual(runInContext('JSON.stringify(Object.groupBy([1, 2, 3], it => it % 2))', context), '{"0":[2],"1":[1,3]}', 'bundle ie 11 #5');
strictEqual(runInContext('[1, 2, 3].at(-1)', context), 3, 'bundle ie 11 #6');
strictEqual(runInContext('typeof structuredClone', context), 'undefined', 'bundle ie 11 #7');
strictEqual(leftovers.length, 0, 'bundle ie 11 #8');

echo(chalk.green('builder tested'));
