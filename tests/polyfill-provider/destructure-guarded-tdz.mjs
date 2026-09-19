// Lexical initialization is observable before the ES5 lowering used by the e2e suite, whose
// block-scoping transform deliberately does not emulate TDZ. Execute the same persistent source
// through native and both emitters in modern Node; no lowering can erase this order obligation.
import { execFile } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { transformAsync } from '@babel/core';
import plugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { createChecker } from './harness.mjs';

const { checkDeep, finish } = createChecker('destructure-guarded-tdz');
const options = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const source = await fs.readFile(new URL('../transpiler-fixtures/usage-pure/guarded-nested-tdz/input.mjs', import.meta.url), 'utf8');
const babel = (await transformAsync(source, {
  filename: 'guarded-tdz.mjs', configFile: false, babelrc: false, plugins: [[plugin, options]],
})).code;
const unplugin = createUnplugin(options).transform(source, 'guarded-tdz.mjs')?.code ?? source;
const tmp = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(tmp);
const directory = await fs.mkdtemp(path.join(tmp, 'guarded-tdz-'));
try {
  for (const [leg, code] of [['native', source], ['babel', babel], ['unplugin', unplugin]]) {
    const file = path.join(directory, `${ leg }.mjs`);
    await fs.outputFile(file, code);
    for (const stripped of [false, true]) {
      const script = `${ stripped ? 'globalThis.WeakSet = undefined;' : '' }
        const { result } = await import(${ JSON.stringify(pathToFileURL(file).href) });
        process.stdout.write(JSON.stringify(result));`;
      // spawned without a shell: through zx's bash a Windows `execPath` loses its backslashes
      const { stdout } = await promisify(execFile)(process.execPath, ['--input-type=module', '-e', script]);
      checkDeep(`${ leg } ${ stripped ? 'stripped' : 'native' }`, JSON.parse(stdout), ['ReferenceError', ['first', 'realm']]);
    }
  }
} finally {
  await fs.remove(directory);
}
finish();
