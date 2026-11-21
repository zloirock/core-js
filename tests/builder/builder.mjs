import { deepStrictEqual, ok, rejects, strictEqual } from 'node:assert/strict';
import { stripVTControlCharacters } from 'node:util';
import { runInNewContext } from 'node:vm';
import builder from 'core-js-builder';
import config from 'core-js-builder/config.js';

const polyfills = await builder({
  modules: 'core-js/actual',
  exclude: [/group-by/, 'esnext.typed-array.to-spliced'],
  targets: { node: 16 },
  format: 'esm',
});

ok(polyfills.includes("import 'core-js/modules/es.error.cause.js';"), 'actual node 16 #1');
ok(polyfills.includes("import 'core-js/modules/es.array.push.js';"), 'actual node 16 #2');
ok(polyfills.includes("import 'core-js/modules/esnext.array.group.js';"), 'actual node 16 #3');
ok(polyfills.includes("import 'core-js/modules/web.structured-clone.js';"), 'actual node 16 #4');
ok(!polyfills.includes("import 'core-js/modules/es.weak-set.js';"), 'actual node 16 #5');
ok(!polyfills.includes("import 'core-js/modules/esnext.weak-set.from.js';"), 'actual node 16 #6');
ok(!polyfills.includes("import 'core-js/modules/esnext.array.group-by.js';"), 'actual node 16 #7');

strictEqual(
  await builder({ targets: 'Android >= 5', format: 'esm' }),
  await builder({ targets: { android: '37' }, format: 'esm' }),
  'mobile browserslist range includes all required polyfills',
);

const modulesPolyfills = await builder({
  modules: 'es.array.at',
  targets: 'supports es6-module',
  format: 'esm',
});

ok(modulesPolyfills.includes("import 'core-js/modules/es.array.at.js';"), 'supports query including Safari TP preserves older targets');

const allPolyfills = await builder({ format: 'esm' });

strictEqual(await builder({ exclude: null, format: 'esm' }), allPolyfills, 'exclude: null means no exclusions');

for (const targets of [{}, { esmodules: false }, 'kaios 2.5']) {
  strictEqual(await builder({ targets, format: 'esm' }), allPolyfills, `empty targets: ${ JSON.stringify(targets) }`);
}

const excludedPolyfills = await builder({
  modules: ['core-js/actual', /^esnext\.reflect\./],
  exclude: [/^es\.math\./, 'es.number.constructor'],
  targets: '> 0.5%, not dead, ie 9-11',
  format: 'cjs',
});

ok(!excludedPolyfills.includes("require('core-js/modules/esnext.math.f16round');"), 'README example excludes Math.f16round alias');
ok(!excludedPolyfills.includes("require('core-js/modules/esnext.math.sum-precise');"), 'README example excludes Math.sumPrecise alias');
ok(excludedPolyfills.includes("require('core-js/modules/es.array.at');"), 'README example preserves unrelated polyfills');

strictEqual(
  await builder({ modules: ['es.array.at', 'esnext.array.at', 'es.array.includes'], exclude: 'esnext.array.at', targets: 'ie 11', format: 'cjs' }),
  await builder({ modules: 'es.array.includes', targets: 'ie 11', format: 'cjs' }),
  'excluding an alias also excludes its stable module and preserves unrelated polyfills',
);

const directory = tmpdir();
const moduleName = 'es.array.includes';
const filename = path.join(directory, 'nested', `${ moduleName }.js`);
const messages = [];
const consoleLog = console.log;
try {
  console.log = message => messages.push(stripVTControlCharacters(message));
  const plain = await builder({ modules: moduleName });
  for (const options of [{ format: null }, { summary: null }, { summary: { comment: null, console: null } }]) {
    strictEqual(await builder({ modules: moduleName, ...options }), plain, `${ JSON.stringify(options) } behaves like omitted options`);
  }
  const bundle = await builder({ modules: moduleName, filename, summary: { comment: true, console: { modules: true } } });
  strictEqual(await fs.readFile(filename, 'utf8'), bundle, 'writes the returned bundle to the requested file');
  const array = runInNewContext(`delete Array.prototype.includes; delete Array.prototype.at;\n${ bundle }\n[NaN]`);
  ok(array.includes(NaN), 'the bundle installs Array.prototype.includes');
  strictEqual(array.at, undefined, 'the bundle skips unselected modules');

  const body = plain.slice(config.banner.length + 1);
  ok(bundle.includes(`/*\n * size: ${ (Buffer.byteLength(body) / 1024).toFixed(2) }KB\n */`), 'comment summary reports the size of the bundle body');
  ok(bundle.includes(` * modules:\n * ${ moduleName }\n`), 'comment summary lists the selected module');
  deepStrictEqual(messages, [stripVTControlCharacters(`bundling ${ filename }, modules:`), moduleName]);

  const empty = await builder({ modules: moduleName, blacklist: moduleName, filename, summary: { console: { size: true } } });
  strictEqual(empty.trimEnd(), config.banner, 'an empty selection produces only the banner');
  const { size } = await fs.stat(filename);
  ok(messages.at(-1).endsWith(`, size: ${ (size / 1024).toFixed(2) }KB`), 'console summary reports the size of the saved file');
  await rejects(builder({ modules: [], filename: directory }), { path: directory });
} finally {
  console.log = consoleLog;
  await fs.remove(directory);
}

await rejects(builder({ modules: [], format: 'umd' }), { name: 'TypeError', message: 'Incorrect output type' });
strictEqual(builder.formatSize('\u{1F600}'.repeat(256)), '1.00KB', 'sizes count UTF-8 bytes');

echo(chalk.green('builder tested'));
