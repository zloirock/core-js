import { ok, strictEqual } from 'node:assert/strict';
import builder from 'core-js-builder';

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

for (const targets of [{}, { esmodules: false }, 'kaios 2.5']) {
  strictEqual(await builder({ targets, format: 'esm' }), allPolyfills, `empty targets: ${ JSON.stringify(targets) }`);
}

echo(chalk.green('builder tested'));
