// Check import sufficiency in fresh workers, including statics missing on the lowest supported Node.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href) : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');

async function transform(source, options, host, filename = 'input.mjs') {
  if (host === 'babel') return (await transformAsync(source, {
    configFile: false, babelrc: false, filename, plugins: [[babelPlugin, options]],
    parserOpts: filename.endsWith('.ts') ? { plugins: ['typescript'] } : undefined,
  })).code;
  const plugin = createUnplugin(options);
  for (const phase of host === 'pre+post' ? ['pre', 'post'] : ['single']) source = plugin.transform(source, filename, phase)?.code ?? source;
  return source;
}

const { check, finish } = createChecker('standalone-imports');
const tmp = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(tmp);
const directory = await fs.mkdtemp(path.join(tmp, 'standalone-imports-'));
let serial = 0;
try {
  for (const [name, source, expected = 'OK|7|[]', stripPrelude = ''] of [
    ...['Error', 'TypeError'].map(receiver => [receiver,
      `export const effects = []; export const r = [${ receiver }.isError(new Error('x')), ${ receiver }.isError({})];`, 'OK|[true,false]|[]']),
    ['call-result', 'export const effects = []; function pick(P) { return P || Promise; } export const r = await ({ P: pick() }).P.try(() => 7);'],
    // Node 22 has no native getOrInsert to compare against in the differential corpus.
    ['instance-super-weak-map', `class Cache extends WeakMap { read(key, value) { return super.getOrInsert(key, value); } }
      const cache = new Cache(); const key = {};
      export const effects = []; export const r = [cache.read(key, 7), cache.get(key), cache.read(key, 9)];`,
    'OK|[7,7,7]|[]', 'import "data:text/javascript,delete WeakMap.prototype.getOrInsert";\n'],
    ['disabled-static', `export const effects = []; const wrapper = { C: Iterator }; const {
      // core-js-disable-next-line
      C: { from },
    } = wrapper; export const r = from([7]).next().value;`],
  ]) for (const method of ['usage-pure', 'usage-global']) {
    const options = { method, version: '4.0', targets: { ie: 11 } };
    for (const host of ['babel', 'unplugin', 'pre+post']) {
      const code = await transform(source, options, host);
      const file = path.join(directory, `case-${ serial++ }.mjs`);
      for (const strip of [false, true]) {
        await fs.writeFile(file, strip ? stripPrelude + code : code);
        check(`${ name }/${ method }/${ host }/${ strip }`, await runInWorker(file, { strip }),
          name === 'disabled-static' && method === 'usage-global' && strip ? 'ERR|TypeError' : expected);
      }
    }
  }
  // The shared stripped realm keeps filter. Remove it before the tested module imports core-js.
  await fs.writeFile(path.join(directory, 'without-filter.mjs'), "delete Array.prototype.filter; if ('filter' in []) throw Error('filter still present');");
  for (const conditional of [false, true]) {
    const source = `export const effects: number[] = [];
      function read(flag: boolean) {
        enum Methods { Name = 'map' }
        ${ conditional ? 'if (flag) ' : '' }(Methods as any).Name = 'filter';
        return [[1, 2], [3]].flat?.()[Methods.Name](value => { effects.push(value); return value % 2; });
      }`;
    scenarioSource(source);
    for (const method of ['usage-pure', 'usage-global']) for (const host of ['babel', 'unplugin', 'pre+post']) {
      const output = await transform(source, { method, version: '4.0', targets: { ie: 11 } }, host, 'input.ts');
      const { code } = await transformAsync(output, {
        filename: 'input.ts', configFile: false, babelrc: false, plugins: [requireBabel.resolve('@babel/plugin-transform-typescript')],
      });
      for (const strip of [false, true]) {
        const file = path.join(directory, `enum-${ serial++ }.mjs`);
        const calls = conditional && strip ? '[read(false)]' : '[read(false), read(true)]';
        const prelude = strip ? 'import "./without-filter.mjs";\n' : '';
        await fs.writeFile(file, `${ prelude }${ code }\nexport const r = ${ calls };`);
        const expected = conditional && strip ? 'OK|[[1,0,1]]|[1,2,3]'
          : `OK|[${ conditional ? '[1,0,1]' : '[1,3]' },[1,3]]|[1,2,3,1,2,3]`;
        check(`enum key/${ method }/${ host }/conditional=${ conditional }/missing filter=${ strip }`, await runInWorker(file, { strip: false }), expected);
      }
    }
  }
} finally {
  await fs.remove(directory);
}
finish();
