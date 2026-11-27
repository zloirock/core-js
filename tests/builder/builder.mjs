import { ok, rejects, strictEqual, throws } from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { createContext, runInContext } from 'node:vm';
import builder from '@core-js/builder';
import { getRolldownOptions } from '@core-js/builder/config.js';

const { tmpdir } = os;
const { join } = path;

// The default-target cases run without Browserslist environment overrides.
delete process.env.BROWSERSLIST;
delete process.env.BROWSERSLIST_CONFIG;

const { script } = await builder({
  modules: 'actual',
  exclude: [/group-by/, 'es.typed-array.with'],
  targets: { node: 16 },
  format: 'esm',
});

ok(script.includes("import 'core-js/modules/es.error.cause.js';"), 'actual node 16 #1');
ok(script.includes("import 'core-js/modules/es.array.push.js';"), 'actual node 16 #2');
ok(script.includes("import 'core-js/modules/esnext.promise.all-keyed.js';"), 'actual node 16 #3');
ok(script.includes("import 'core-js/modules/web.structured-clone.js';"), 'actual node 16 #4');
ok(!script.includes("import 'core-js/modules/es.weak-set.constructor.js';"), 'actual node 16 #5');
ok(!script.includes("import 'core-js/modules/es.typed-array.with.js';"), 'actual node 16 #6');
ok(!script.includes("import 'core-js/modules/es.object.group-by.js';"), 'actual node 16 #7');
ok(!script.includes("import 'core-js/modules/esnext.string.dedent.js';"), 'actual node 16 #8');

async function build(options) {
  return (await builder(options)).script;
}

strictEqual(
  await build({ targets: 'Android >= 5', format: 'esm' }),
  await build({ targets: { android: '37' }, format: 'esm' }),
  'mobile browserslist range includes all required polyfills',
);

ok((await build({
  modules: 'es.array.at',
  targets: 'supports es6-module',
  format: 'esm',
})).includes("import 'core-js/modules/es.array.at.js';"), 'supports query including Safari TP preserves older targets');

const allPolyfills = await build({ format: 'esm' });

strictEqual(await build({ exclude: null, format: 'esm' }), allPolyfills, 'exclude: null means no exclusions');

for (const targets of [{}, { esmodules: false }, 'kaios 2.5']) {
  strictEqual(await build({ targets, format: 'esm' }), allPolyfills, `empty targets: ${ JSON.stringify(targets) }`);
}

// Rolldown warns about unresolved imports even though the resulting bundle is incomplete.
const options = getRolldownOptions('input.js', 'output.js');
throws(() => options.onLog('warn', { code: 'UNRESOLVED_IMPORT', message: 'dropped module' }, () => {
  throw new Error('delegated instead of failing');
}), /dropped module/, 'an unresolved import fails the build');

let delegated = null;
options.onLog('warn', { code: 'CIRCULAR_DEPENDENCY' }, (level, log) => delegated = log.code);
strictEqual(delegated, 'CIRCULAR_DEPENDENCY', 'other diagnostics reach the default handler');

// point the OS temporary directory at one the test owns, so both the location of the scratch files and their
// removal are observable - an unreachable one has to break the build, a writable one has to come back empty
const sandbox = await fs.mkdtemp(join(tmpdir(), 'core-js-builder-test-'));
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
const leftovers = await fs.readdir(sandbox);

for (const [key, value] of Object.entries(restore)) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

await fs.remove(sandbox);

const context = createContext({});

runInContext('delete Object.groupBy; delete Array.prototype.at;', context);
runInContext(bundle, context);

strictEqual(runInContext('typeof Object.groupBy', context), 'function', 'bundle ie 11 #3');
strictEqual(runInContext('typeof Array.prototype.at', context), 'function', 'bundle ie 11 #4');
strictEqual(runInContext('JSON.stringify(Object.groupBy([1, 2, 3], it => it % 2))', context), '{"0":[2],"1":[1,3]}', 'bundle ie 11 #5');
strictEqual(runInContext('[1, 2, 3].at(-1)', context), 3, 'bundle ie 11 #6');
strictEqual(runInContext('typeof structuredClone', context), 'undefined', 'bundle ie 11 #7');
strictEqual(leftovers.length, 0, 'bundle ie 11 #8');

// npm links node_modules/core-js to the workspace regardless of the workspace directory name.
const workspace = await fs.mkdtemp(join(tmpdir(), 'core-js-builder-workspace-'));
try {
  const modules = join(workspace, 'app/node_modules');
  const builderDir = join(modules, '@core-js/builder');
  const polyfills = join(workspace, 'local-polyfills');
  await fs.copy('packages/core-js-builder', builderDir, { filter: file => path.basename(file) !== 'node_modules' });
  await fs.symlink(path.resolve('node_modules'), join(workspace, 'node_modules'), 'junction');
  await fs.copy('packages/core-js/package.json', join(polyfills, 'package.json'));
  await fs.outputFile(join(polyfills, 'modules/es.array.at.js'), "globalThis.loadedFrom = 'local-polyfills';");
  await fs.symlink(polyfills, join(modules, 'core-js'), 'junction');

  const { default: workspaceBuilder } = await import(pathToFileURL(join(builderDir, 'index.js')));
  const { script: workspaceBundle } = await workspaceBuilder({ modules: 'es.array.at', targets: { ie: 11 } });
  const workspaceGlobal = createContext({});
  runInContext(workspaceBundle, workspaceGlobal);
  strictEqual(workspaceGlobal.loadedFrom, 'local-polyfills', 'bundle loads core-js from the linked workspace');
} finally {
  await fs.remove(workspace);
}

echo(chalk.green('builder tested'));
