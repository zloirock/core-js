// Each output gets its own realm: a neighboring import must not populate a narrow constructor.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { importSet } from '../transpiler-differential/harness.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('census-static-runtime');
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'census-static-'));
let count = 0;

const cases = [
  ['late block', 'class C { static M = Map; static {} } r = typeof C.M.groupBy;'],
  ['late unknown key', "const k = String('other'); class C { static M = Map; static [k] = 1; } r = typeof C.M.groupBy;"],
  ['getter and block', "class C { static get M() { effects.push('get'); return Map; } static {} } r = typeof C.M.groupBy;", ['get']],
  ['getter then setter', "class C { static get M() { effects.push('get'); return Map; } static set M(v) { effects.push('set'); } } r = typeof C.M.groupBy;", ['get']],
  ['setter then getter', "class C { static set M(v) { effects.push('set'); } static get M() { effects.push('get'); return Map; } } r = typeof C.M.groupBy;", ['get']],
  ['nested getter pattern', "class C { static get M() { effects.push('get'); return Map; } static set M(v) {} } const { M: { groupBy } } = C; r = typeof groupBy;", ['get']],
  ['static read and later barrier', 'class C { static M = Map; static { effects.push(typeof C.M.groupBy); } static {} } r = typeof C.M.groupBy;', ['function']],
  ['static read before a later field',
    'class C { static M = Map; static { effects.push(typeof C.M.groupBy); } static M = { groupBy() { return 7; } }; } r = C.M.groupBy();',
    ['function'], '', 7],
  ['own setter masks heritage', 'class C extends Map { static set groupBy(value) {} } r = typeof C.groupBy;', [], '', 'undefined'],
  ['unknown own slot keeps heritage', 'class C extends Map { static {} } r = typeof C.groupBy;'],
  ['block replaces heritage', "class C extends Map { static { this.groupBy = () => (effects.push('call'), 23); } } r = C.groupBy();", ['call'], '', 23],
  ['loop key', "for (const k of ['groupBy']) r = typeof Map[k];"],
  ['object key', "const { k } = { k: 'groupBy' }; r = typeof Map[k];"],
  ['catch key', "try { throw 'groupBy'; } catch (k) { r = typeof Map[k]; }"],
  ['parameter key', "function f(k, C) { return typeof Map[k]; } r = f('groupBy', Set);"],
  ['equal writes', "let k = 'groupBy'; if (flag) k = 'groupBy'; r = typeof Map[k];", [], 'const flag = true;'],
  ['conditional assignment taken', "let k; if (flag) k = 'groupBy'; r = typeof Map[k];", [], 'const flag = true;'],
  ['conditional assignment skipped', "let k; if (flag) k = 'groupBy'; r = typeof Map[k];", [], 'const flag = false;', 'undefined'],
  ['conditional initializer taken', "if (flag) var k = 'groupBy'; r = typeof Map[k];", [], 'const flag = true;'],
  ['conditional initializer skipped', "if (flag) var k = 'groupBy'; r = typeof Map[k];", [], 'const flag = false;', 'undefined'],
  ['deferred writer', "let k; function init() { k = 'groupBy'; } init(); r = typeof Map[k];"],
  ['deep aliases', `const k0 = 'groupBy'; ${ Array.from({ length: 66 }, (_, i) => `const k${ i + 1 } = k${ i };`).join(' ') } r = typeof Map[k66];`],
  ['deep array alias', `const k0 = 'groupBy'; ${ Array.from({ length: 66 }, (_, i) => `const k${ i + 1 } = k${ i };`).join(' ') } const [key] = [k66]; r = typeof Map[key];`],
  // Pure cannot replace these native owners or fold these keys. Its stripped negative
  // controls preserve the native read; only global must install the unnamed statics.
  ['literal key on native owner', "r = typeof Object[['hasOwn'][0]];", [], '', 'function', '', 'undefined'],
  ['opaque presence on native owner', "const k = String('hasOwn'); r = k in Object;", [], '', true, '', false],
  ['opaque callback presence', "const keys = ['isInteger']; r = keys.every(k => k in Number);", [], '', true, '', false],
];

for (const key of ['P', 'other']) {
  for (const [shape, members, read, effects = []] of [
    ['guarded', 'static P = Map; static [key] = Object;', 'const { P: { groupBy } } = C;'],
    ['nested', 'static P = { M: Map }; static [key] = { M: Object };', 'const { P: { M: { groupBy } } } = C;'],
    ['getter', "static get P() { effects.push('get'); return Map; } static [key] = Object;",
      'const { P: { groupBy } } = C;', key === 'P' ? [] : ['get']],
    ['written', 'static P = Map; static [key] = Object;', 'C.P = Map; const { P: { groupBy } } = C;'],
    ['rest', 'static P = Map; static [key] = { groupBy(values) { return { 3: values }; } };', 'const { P: { groupBy, ...rest } } = C;'],
    ['default', 'static P = Map; static [key] = { groupBy(values) { return { 3: values }; } };', 'const { P: { groupBy = () => 0 } } = C;'],
  ]) cases.push([`class candidates/${ shape }/${ key }`, `class C { ${ members } } ${ read }
    const grouped = groupBy([3], value => value); r = typeof grouped.get === 'function' ? grouped.get(3) : grouped[3];`,
  effects, `const key = ${ JSON.stringify(key) };`, [3]]);
}

for (const reverse of [false, true]) {
  const reads = ["for (const key of ['groupBy']) effects.push(key in C);", 'effects.push(opaque in C);'];
  if (reverse) reads.reverse();
  cases.push([`presence cache/${ reverse }`, `const C = Map; ${ reads.join(' ') } r = true;`, [true, true], "const opaque = 'groupBy';", true]);
}

// The consumer is deliberately appended AFTER transformation. It observes the exported namespace,
// not a second static claim in the producer that would accidentally install the missing module.
for (const [name, store] of [
  ['method', "Object.defineProperty(api, 'M', { get() { effects.push('get'); return Map; } });"],
  ['arrow', "Reflect.defineProperty(api, 'M', { get: () => (effects.push('get'), Map) });"],
  ['descriptors', "Object.defineProperties(api, { M: { get() { effects.push('get'); return Map; } } });"],
  ['bound', "const M = Map; Object.defineProperty(api, 'M', { enumerable: true, get: function () { effects.push('get'); return M; } });"],
  ['branched', "Object.defineProperty(api, 'M', { get() { effects.push('get'); if (api) return Map; return Set; } });"],
]) cases.push([`accessor export/${ name }`, `export const api = {}; ${ store }`, ['get'], '', 'function', 'r = typeof api.M.groupBy;']);

for (const [name, body, effects = [], result = 'function'] of [
  ['pattern key', "const k = 'w'; const { [k]: { groupBy } } = { w: Map }; r = typeof groupBy;"],
  ['numeric key', 'const { 1: { groupBy } } = { 1: Map }; r = typeof groupBy;'],
  ['array key', 'const { [0]: { groupBy } } = [Map]; r = typeof groupBy;'],
  ['literal key', "const k = 'w'; const { w: { groupBy } } = { [k]: Map }; r = typeof groupBy;"],
  ['getter', "const { w: { groupBy } } = { get w() { effects.push('get'); return Map; } }; r = typeof groupBy;", ['get']],
  ['paired setter', "const { w: { groupBy } } = { get w() { effects.push('get'); return Map; }, set w(v) { effects.push('set'); } }; r = typeof groupBy;", ['get']],
  ['unknown getter', "const k = String('w'); const { w: { groupBy } } = { get [k]() { effects.push('get'); return Map; } }; r = typeof groupBy;", ['get']],
  ['unknown pattern', "const k = String('w'); const { [k]: { groupBy } } = { get w() { effects.push('get'); return Map; } }; r = typeof groupBy;", ['get']],
  ['key effects', "const k = 'w'; const { [(effects.push('key'), k)]: { groupBy } } = { get w() { effects.push('get'); return Map; } }; r = typeof groupBy;", ['key', 'get']],
  ['assignment', "let groupBy; const k = 'w'; ({ [k]: { groupBy } } = { w: Map }); r = typeof groupBy;"],
  ['parameter', "const k = 'w'; function read({ [k]: { groupBy } } = { w: Map }) { return typeof groupBy; } r = read();"],
  ['getter throw',
    "try { const { w: { groupBy } } = { get w() { effects.push('get'); throw new RangeError(); } }; r = groupBy; } catch (error) { r = error.name; }", ['get'], 'RangeError'],
  ['unknown overwrite', "const k = String('w'); const { w: { groupBy } } = { w: Map, [k]: { groupBy: () => 23 } }; r = groupBy();", [], 23],
  ['known overwrite', "const k = String('w'); const { w: { groupBy } } = { [k]: Map, w: { groupBy: () => 23 } }; r = groupBy();", [], 23],
  ['getter data overwrite', "const { w: { groupBy } } = { get w() { effects.push('get'); return Map; }, w: { groupBy: () => 23 } }; r = groupBy();", [], 23],
  ['unknown sibling after getter', "const k = String('other'); const { w: { groupBy } } = { get w() { effects.push('get'); return Map; }, [k]: {} }; r = typeof groupBy;", ['get']],
  ['unknown between accessors', "const k = String('other'); const { w: { groupBy } } = { get w() { effects.push('get'); return Map; },"
    + " [k]: {}, set w(v) { effects.push('set'); } }; r = typeof groupBy;", ['get']],
  ['data breaks accessor pair', "const k = String('w'); try { const { w: { groupBy } } = { get w() { effects.push('get'); return Map; },"
    + ' [k]: {}, set w(v) {} }; r = groupBy; } catch (error) { r = error.name; }', [], 'TypeError'],
  ['getter assignment', "let groupBy; ({ w: { groupBy } } = { get w() { effects.push('get'); return Map; } }); r = typeof groupBy;", ['get']],
  ['loop key', "const k = 'w'; for (const { [k]: { groupBy } } of [{ w: Map }]) r = typeof groupBy;"],
  ['shadowed key', "const k = 'other'; function read() { const k = 'w'; const { [k]: { groupBy } } = { w: Map }; return typeof groupBy; } r = read();"],
]) cases.push([`literal read-back/${ name }`, body, effects, '', result]);

try {
  for (const [name, body, effects = [], setup = '', result = 'function', consumer = '', pureStripped = result] of cases) {
    const source = scenarioSource(`export let r; export const effects = []; ${ body }`);
    for (const method of ['usage-global', 'usage-pure']) {
      const options = { method, version: '4.0', targets: { ie: 11 } };
      const babel = (await transformAsync(source, {
        filename: 'input.mjs', configFile: false, babelrc: false, plugins: [[babelPlugin, options]],
      })).code;
      const plugin = createUnplugin(options);
      const single = createUnplugin(options).transform(source, 'input.mjs')?.code ?? source;
      const pre = plugin.transform(source, 'input.mjs', 'pre')?.code ?? source;
      const post = plugin.transform(pre, 'input.mjs', 'post')?.code ?? pre;
      check(`${ name }/${ method }/phase imports`, JSON.stringify([...importSet(post)].sort()), JSON.stringify([...importSet(single)].sort()));
      for (const [host, output] of [['native', source], ['babel', babel], ['unplugin', single], ['pre+post', post]]) {
        if (host === 'native' && method === 'usage-pure') continue;
        const file = path.join(DIR, `case-${ count++ }.mjs`);
        await fs.outputFile(file, `${ setup }\n${ output }\n${ consumer }`);
        const expected = `OK|${ JSON.stringify(result) }|${ JSON.stringify(effects) }`;
        check(`${ name }/${ method }/${ host }/full`, await runInWorker(file, { strip: false }), expected);
        if (host !== 'native') check(`${ name }/${ method }/${ host }/stripped`, await runInWorker(file),
          `OK|${ JSON.stringify(method === 'usage-pure' ? pureStripped : result) }|${ JSON.stringify(effects) }`);
      }
    }
  }
} finally {
  await fs.remove(DIR);
}

finish();
