// Check import sufficiency in fresh workers. Error statics need an explicit reference on
// the lowest supported Node; the opted-out static has different pure and global contracts.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href) : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');

async function transform(source, options, host) {
  if (host === 'babel') return (await transformAsync(source, {
    configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, options]],
  })).code;
  const plugin = createUnplugin(options);
  for (const phase of host === 'pre+post' ? ['pre', 'post'] : ['single']) source = plugin.transform(source, 'input.mjs', phase)?.code ?? source;
  return source;
}

const { check, finish } = createChecker('standalone-imports');
const tmp = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(tmp);
const directory = await fs.mkdtemp(path.join(tmp, 'standalone-imports-'));
let serial = 0;
try {
  for (const [name, source] of [
    ...['Error', 'TypeError'].map(receiver => [receiver,
      `export const effects = []; export const r = [${ receiver }.isError(new Error('x')), ${ receiver }.isError({})];`]),
    ['disabled-static', `export const effects = []; const wrapper = { C: Iterator }; const {
      // core-js-disable-next-line
      C: { from },
    } = wrapper; export const r = from([7]).next().value;`],
  ]) for (const method of ['usage-pure', 'usage-global']) {
    const options = { method, version: '4.0', targets: { ie: 11 } };
    for (const host of ['babel', 'unplugin', 'pre+post']) {
      const code = await transform(source, options, host);
      const file = path.join(directory, `case-${ serial++ }.mjs`);
      await fs.writeFile(file, code);
      for (const strip of [false, true]) check(`${ name }/${ method }/${ host }/${ strip }`,
        await runInWorker(file, { strip }), name !== 'disabled-static' ? 'OK|[true,false]|[]'
          : method === 'usage-global' && strip ? 'ERR|TypeError' : 'OK|7|[]');
    }
  }
} finally {
  await fs.remove(directory);
}
finish();
