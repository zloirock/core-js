import { ok } from 'node:assert/strict';
import builder from 'core-js-builder';

const { script } = await builder({
  modules: 'core-js/actual',
  exclude: [/group-by/, 'es.typed-array.with'],
  targets: { node: 16 },
  format: 'esm',
});

ok(script.includes("import 'core-js/modules/es.error.cause.js';"), 'actual node 16 #1');
ok(script.includes("import 'core-js/modules/es.array.push.js';"), 'actual node 16 #2');
ok(script.includes("import 'core-js/modules/esnext.iterator.zip.js';"), 'actual node 16 #3');
ok(script.includes("import 'core-js/modules/web.structured-clone.js';"), 'actual node 16 #4');
ok(!script.includes("import 'core-js/modules/es.weak-set.constructor.js';"), 'actual node 16 #5');
ok(!script.includes("import 'core-js/modules/es.typed-array.with.js';"), 'actual node 16 #6');
ok(!script.includes("import 'core-js/modules/esnext.object.group-by.js';"), 'actual node 16 #7');
ok(!script.includes("import 'core-js/modules/esnext.weak-set.from.js';"), 'actual node 16 #8');

echo(chalk.green('builder tested'));
