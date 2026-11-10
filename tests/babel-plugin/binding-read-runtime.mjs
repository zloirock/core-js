// Read-position binding lookup preserves captured bases, lexical shadows and key effects.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { transform as lower } from '@swc/core';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('binding-read-runtime', { tsc: 'Dynamic JS class bases and local namespace syntax are intentional parser/runtime probes.' });
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'binding-read-'));
const cases = [
  ['block-iife', `{ var Arr = Array; }
return (({ from } = Object) => from([3])[0])(Arr);`, 3, []],
  ['undefined-shadow', `{ var undefined = Array; }
return (({ from } = Object) => from([4])[0])(undefined);`, 4, []],
  ['undefined-empty', `{ var undefined; }
return (({ from } = Array) => from([4])[0])(undefined);`, 4, []],
  ['undefined-void', `{ var undefined = void effects.push('init'); }
return (({ from } = Array) => from([4])[0])(undefined);`, 4, ['init']],
  ['undefined-observed', `{ var undefined; }
return (function ({ from } = Array) { return [from([4])[0], arguments[0] === void 0]; })(undefined);`, [4, true], []],
  ['undefined-written', `{ var undefined; } undefined = { from() { effects.push('own'); return [5]; } };
return (({ from } = Array) => from([4])[0])(undefined);`, 5, ['own']],
  ['undefined-loop', `let result; for (var undefined of [{ from() { return [6]; } }]) {
result = (({ from } = Array) => from([4])[0])(undefined); } return result;`, 6, []],
  ['undefined-inner-shadow', `{ var undefined; } let result; {
const undefined = { from() { return [7]; } }; result = (({ from } = Array) => from([4])[0])(undefined);
} return result;`, 7, []],
  ['undefined-tdz', `try { (({ from } = Array) => from([4])[0])(undefined); let undefined; }
catch (error) { return error.name; }`, 'ReferenceError', []],
  ['static-undefined-outside', `class Box { static { var undefined = Object; } }
return (({ from } = Array) => from([4])[0])(undefined);`, 4, []],
  ['namespace-undefined-outside', `namespace Box { var undefined = Object; }
return (({ from } = Array) => from([4])[0])(undefined);`, 4, []],
  ['class-base', `{ var Base = Array; }
class List extends Base {
  static read() { return super.from([5]); }
  static other() { return this.of(6); }
}
return [List.read()[0], List.read() instanceof List, List.other()[0]];`, [5, true, 6], []],
  ['captured-base', `{ var Base = Array; }
class List extends Base { static read() { const Base = String; return super.from([7]); } }
Base = String;
return [List.read()[0], List.read() instanceof List];`, [7, true], []],
  ['local-base', `{ var Base = class { static from() { effects.push('own'); return 8; } }; }
class List extends Base { static read() { return super.from([]); } }
return List.read();`, 8, ['own']],
  ['container-base', `{ var NS = { Base: Array }; }
class List extends NS.Base { static read() { return super.from([9]); } }
return [List.read()[0], List.read() instanceof List];`, [9, true], []],
  ['missing-base', `let caught; try { { var Base; } class List extends Base {
  static read() { return super.from([]); }
} } catch (error) { caught = error.name; } return caught;`, 'TypeError', []],
  ['static-key', `let result;
class Box { static { const key = 'name'; const object = { [key]: 'alice' };
{ const key = 'other'; result = object.name.at(-1); } } }
return result;`, 'e', []],
  ['static-class', `let result;
class Box { static { class Item { value = 'alice'; } const item = new Item(); result = item.value.at(-1); } }
return result;`, 'e', []],
  ['static-outside', `const key = 'name'; class Box { static { const key = 'other'; } }
const object = { [key]: 'alice', other: [] }; return object.name.at(-1);`, 'e', []],
  ['namespace-outside', `const key = 'name'; namespace Box { const key = 'other'; }
const object = { [key]: 'alice', other: [] }; return object.name.at(-1);`, 'e', []],
  ['namespace-key', `let result; namespace Box { const key = 'name';
const { [key]: value } = { name: 'alice' }; result = value.at(-1); } return result;`, 'e', []],
  ['namespace-assignment', `let result; namespace Box { const key = 'name'; let value;
({ outer: { [key]: value } } = { outer: { name: 'alice' } }); result = value.at(-1); } return result;`, 'e', []],
  ['namespace-deferred', `let result; namespace Box { let value; ({ value } = { value: 'alice' });
function update() { value = [17]; } update(); result = value.at(-1); } return result;`, 17, []],
  ['namespace-loop', `let result = []; namespace Box { let value; ({ value } = { value: 'alice' });
for (let i = 0; i < 2; i++) { result.push(value.at(-1)); value = [17]; } } return result;`, ['e', 17], []],
  ['parameter-annotation', `function convert(input: number): number[] { return [input]; }
function read(value: ReturnType<typeof convert> = 'abc') {
  function convert(input: string) { return input; }
  return value.includes('bc');
} return read();`, true, []],
  ['parameter-rest-annotation', `function convert(input: number): number[] { return [input]; }
function read(...values: ReturnType<typeof convert>[]) {
  function convert(input: string) { return input; }
  return values[0].includes('bc');
} return read('abc');`, true, []],
  ['parameter-object-annotation', `function convert(input: number): number[] { return [input]; }
function read({ value }: { value: ReturnType<typeof convert> } = { value: 'abc' }) {
  function convert(input: string) { return input; }
  return value.includes('bc');
} return read();`, true, []],
  ['parameter-array-annotation', `function convert(input: number): number[] { return [input]; }
function read([value]: ReturnType<typeof convert>[] = ['abc']) {
  function convert(input: string) { return input; }
  return value.includes('bc');
} return read();`, true, []],
  ['parameter-property-annotation', `function convert(input: number): number[] { return [input]; }
class Box { result: boolean;
  constructor(public value: ReturnType<typeof convert> = 'abc') {
    function convert(input: string) { return input; }
    this.result = value.includes('bc');
  }
} return new Box().result;`, true, []],
  ['parameter-runtime-scope', `function convert() { return 'abc'; }
function read(value = convert()) {
  function convert() { return [1]; }
  return value.includes('bc');
} return read();`, true, []],
  ['key-effects', `let result; class Box { static { function key() { effects.push('key'); return 'name'; }
const object = { [key()]: 'alice' }; result = object.name.at(-1); } } return result;`, 'e', ['key']],
  ['nested-extraction', `let result; class Box { static { const key = 'items';
const { [key]: { at } } = { items: [1, 2] }; result = at.call([3, 4], -1); } } return result;`, 4, []],
];
await transformAsync('let value; value; value;', {
  filename: 'input.mjs', configFile: false, babelrc: false,
  plugins: [() => ({
    visitor: {
      Program(program) {
        const read = program.get('body')[1].get('expression');
        const binding = createBabelAdapter().getBinding({ scope: read.scope, name: 'value', path: read });
        check('native read counter', binding.references, 2);
      },
    },
  })],
});
let index = 0;
try {
  for (const [name, body, expected, events] of cases) {
    const source = scenarioSource(`export const effects = []; export const r = (() => { ${ body } })();`);
    const typed = name.startsWith('namespace-') || name.startsWith('parameter-') && name !== 'parameter-runtime-scope';
    const filename = typed ? 'input.ts' : 'input.mjs';
    const babel = (await transformAsync(source, {
      filename, configFile: false, babelrc: false, parserOpts: { plugins: typed ? ['typescript'] : [] },
      plugins: [[babelPlugin, OPTIONS]],
    })).code;
    const plugin = createUnplugin(OPTIONS);
    const pre = plugin.transform(source, filename, 'pre')?.code ?? source;
    const post = plugin.transform(pre, filename, 'post')?.code ?? pre;
    for (const [host, output] of [['native', source], ['babel', babel], ['unplugin', pre], ['pre+post', post]]) {
      for (const lowered of host === 'native' ? [true] : [false, true]) {
        const code = typed || lowered ? (await lower(output, {
          filename, jsc: { parser: { syntax: typed ? 'typescript' : 'ecmascript' }, target: lowered ? 'es2015' : 'es2022' },
          module: { type: 'es6' },
        })).code : output;
        const file = path.join(DIR, `case-${ index++ }.mjs`);
        await fs.outputFile(file, code);
        for (const strip of host === 'native' ? [false] : [false, true]) {
          check(`${ name }/${ host }/${ lowered }/${ strip }`, await runInWorker(file, { strip }),
            `OK|${ JSON.stringify(expected) }|${ JSON.stringify(events) }`);
        }
      }
    }
  }
} finally {
  await fs.remove(DIR);
}
finish();
