// Isolate the source of each import: another read in the same fixture can owe the same module.
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import unplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { importSet } from '../transpiler-differential/import-sources.mjs';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { check, finish } = createChecker('type-declaration-imports');
const requireBabel = createRequire(process.env.BABEL_REQUIRE_FROM ? resolve(process.env.BABEL_REQUIRE_FROM, 'package.json') : import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const options = { method: 'usage-global', version: '4.0', targets: { ie: 11 } };
const { transform } = unplugin(options);
async function checkImports(label, source, required, absent) {
  const babel = (await transformAsync(source, { filename: 'input.ts', configFile: false, babelrc: false,
    parserOpts: { plugins: ['typescript'] }, plugins: [[babelPlugin, options]] })).code;
  for (const [host, output] of [['babel', babel], ['unplugin', transform(source, 'input.ts')?.code ?? source]]) {
    const imports = importSet(output);
    for (const item of required) check(`${ label }/${ host }/requires ${ item }`, imports.has(`core-js/modules/${ item }`), true);
    for (const item of absent) check(`${ label }/${ host }/excludes ${ item }`, imports.has(`core-js/modules/${ item }`), false);
  }
}

function fixture(name) {
  return readFile(new URL(`../transpiler-fixtures/usage-global/${ name }/input.mjs`, import.meta.url), 'utf8');
}

const parseCalls = await fixture('audit-ts-cast-callee-min-args-filter-passes');
const wrappedCalls = parseCalls.split('\n').filter(line => line.endsWith('(jsonString, reviver);'));
check('four JSON.parse call spellings', wrappedCalls.length, 4);
for (const call of wrappedCalls) {
  await checkImports(call, call, ['es.json.parse'], []);
  await checkImports(`${ call } without reviver`, call.replace(', reviver', ''), [], ['es.json.parse']);
}
for (const name of [
  'super-of-via-container-alias',
  'super-of-via-switch',
  'super-of-via-shadowed-container',
]) {
  const source = await fixture(name);
  await checkImports(name, source, ['es.array.of'], []);
  await checkImports(`${ name } without super.of`, source.replace('super.of(1)', '1'), [], ['es.array.of']);
}
const aliases = await fixture('audit-proxy-root-member-init-alias');
await checkImports('both realm aliases', aliases, ['es.array.from', 'es.array.of'], []);
await checkImports('without member alias read', aliases.replace('viaMember.Array.from([1, 2])', '[1, 2]'), ['es.array.of'], ['es.array.from']);
await checkImports('without name alias read', aliases.replace('viaName.Array.of(3, 4)', '[3, 4]'), ['es.array.from'], ['es.array.of']);
const shadows = await fixture('audit-shadowed-realm-name-claims');
await checkImports('shadowed Map and global Set', shadows, ['es.set.constructor'], ['es.map.constructor']);
await checkImports('genuine Map read', shadows.replace('?.Set.name', '?.Map.name'), ['es.map.constructor'], ['es.set.constructor']);

const map = 'es.map.constructor';
const set = 'es.set.constructor';
await checkImports('nested infer', 'export type T<X> = X extends { v: string extends infer Map ? Map : never } ? Map<string, number> : never;', [map], []);
await checkImports('own infer', 'export type T<X> = X extends { v: infer Map } ? Map : never;', [], [map]);
await checkImports('import qualifier', "export type T = import('./collection').Map<string, number>;", [], [map]);
await checkImports('import arguments', "export type T = import('./collection').Map<Set<string>, number>;", [set], [map]);
await checkImports('global type', 'export type T = Map<string, number>;', [map], []);
finish();
