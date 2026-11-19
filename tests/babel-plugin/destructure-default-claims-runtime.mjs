// Default branches and generated capture reads preserve values, order and claim ownership.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href) : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('destructure-default-claims-runtime', {
  tsc: 'Unknown computed slots and deliberately absent constructors exercise runtime defaults.',
});
async function transform(source, host, method) {
  const options = { method, version: '4.0', targets: { ie: 11 } };
  if (host === 'babel') return (await transformAsync(source, {
    configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, options]],
    parserOpts: { createParenthesizedExpressions: true },
  })).code;
  const plugin = createUnplugin(options);
  for (const pass of host === 'pre+post' ? ['pre', 'post'] : ['single']) source = plugin.transform(source, 'input.mjs', pass)?.code ?? source;
  return source;
}
const cases = [];
for (const name of ['AggregateError', 'Map']) for (const host of ['declaration', 'assignment', 'for-init']) {
  const pattern = `{ ${ name }: C = fallback(), other }`;
  const init = '(effects.push("init"), globalThis)';
  const source = host === 'assignment' ? `let C, other; (${ pattern } = ${ init });`
    : host === 'for-init' ? `for (var ${ pattern } = ${ init };;) break;` : `const ${ pattern } = ${ init };`;
  cases.push([`global/${ name }/${ host }`, `function fallback() { effects.push('default'); return function replacement() {}; } ${ source } return typeof C;`, 'function', ['init'], ['usage-global', 'usage-pure']]);
}
for (const name of ['Map', 'Object']) for (const host of ['declaration', 'assignment', 'parameter']) {
  const pattern = `{ [key()]: { groupBy } = (effects.push('default'), ${ name }) }`;
  const read = name === 'Map' ? 'groupBy([1, 2], value => value % 2).get(1)[0]' : 'groupBy([1, 2], value => value % 2)[1][0]';
  const source = host === 'assignment' ? `let groupBy; (${ pattern } = {}); return ${ read };`
    : host === 'parameter' ? `function run(${ pattern }) { return ${ read }; } return run({});`
      : `const ${ pattern } = {}; return ${ read };`;
  // Object has no pure constructor substitution beneath an opaque key; global still owes its static.
  cases.push([`key/${ name }/${ host }`, `function key() { effects.push('key'); return String(Math.random()); } ${ source }`, 1,
    ['key', 'default'], name === 'Map' ? ['usage-global', 'usage-pure'] : ['usage-global']]);
}
for (const key of ['values', 'entries']) for (const nested of [false, true]) {
  const slot = nested ? '{ entries: { at } }' : '{ at }';
  const value = nested ? '{ entries: [7] }' : '[7]';
  cases.push([`capture/${ key }/${ nested }`, `let from, at;
    ({ C: { from }, ${ key }: ${ slot } } = { C: Array, ${ key }: (effects.push('slot'), ${ value }) });
    return at.call([7], 0);`, 7, ['slot'], ['usage-global', 'usage-pure']]);
}
cases.push(['capture/string', `let from, at;
  ({ C: { from }, values: { at } } = { C: Array, values: 'ab' }); return at.call('ab', -1);`,
'b', [], ['usage-global', 'usage-pure']], ['capture/live-child', `let from, at;
  ({ C: { from }, values: { at } } = { C: Array, values: [Array.of(7)] }); return at.call([[7]], 0)[0];`,
7, [], ['usage-global', 'usage-pure']], ['null slot', `const key = String(Math.random());
  try { const { [(effects.push('key'), key)]: { groupBy } = (effects.push('default'), Map) } = { [key]: null };
    return groupBy; } catch (error) { return error.name; }`,
'TypeError', ['key'], ['usage-global', 'usage-pure']], ['throwing getter', `const key = String(Math.random());
  const source = { get [key]() { effects.push('get'); throw new RangeError('slot'); } };
  try { const { [(effects.push('key'), key)]: { groupBy } = (effects.push('default'), Map) } = source;
    return groupBy; } catch (error) { return error.name; }`,
'RangeError', ['key', 'get'], ['usage-global', 'usage-pure']], ['present user slot', `function key() { effects.push('key'); return 'present'; }
  const source = { present: { groupBy() { effects.push('custom'); return 23; } } };
  const { [key()]: { groupBy } = (effects.push('default'), Map) } = source; return groupBy();`,
23, ['key', 'custom'], ['usage-global', 'usage-pure']]);
const directory = await fs.mkdtemp(path.join(import.meta.dirname, '../transpiler-differential/tmp/default-claims-'));
let serial = 0;
try {
  for (const [name, body, expected, effects, methods] of cases) {
    const source = scenarioSource(`export const effects = []; export const r = (() => { ${ body } })();`);
    const nativeFile = path.join(directory, `case-${ serial++ }.mjs`);
    await fs.writeFile(nativeFile, source);
    const want = `OK|${ JSON.stringify(expected) }|${ JSON.stringify(effects) }`;
    check(`${ name }/native`, await runInWorker(nativeFile, { strip: false }), want);
    for (const method of methods) for (const host of ['babel', 'unplugin', 'pre+post']) {
      const output = await transform(source, host, method);
      if (name.startsWith('capture/') && method === 'usage-pure') {
        check(`${ name }/${ host }/no generated navigation helper`, /actual\/instance\/(?:entries|values)["']/u.test(output), false);
      }
      const file = path.join(directory, `case-${ serial++ }.mjs`);
      await fs.writeFile(file, output);
      for (const strip of [false, true]) check(`${ name }/${ method }/${ host }/${ strip }`, await runInWorker(file, { strip,
        stripGlobals: name.startsWith('global/AggregateError/') ? ['Iterator', 'globalThis', 'AggregateError'] : undefined }), want);
    }
  }
} finally {
  await fs.rm(directory, { recursive: true, force: true });
}
finish();
