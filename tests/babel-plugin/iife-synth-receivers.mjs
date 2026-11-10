// A synthesized receiver uses the live source slot without changing the argument
// object observed by its callee. Invocation effects and unresolved keys run once.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { transform as lower } from '@swc/core';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('iife-synth-receivers');
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'iife-receivers-'));
const cases = [];
for (const [name, setup] of [
  ['const', 'const list = Array;'],
  ['var', 'var list = Array;'],
  ['assigned', 'let list; list = Array;'],
]) cases.push([name, `${ setup } return (({ of } = Object) => of(3))(list);`, [3], []]);
for (const [name, argument, events] of [
  ['supplied', 'Array', []],
  ['sequence', '(effects.push("argument"), Array)', ['argument']],
  ['spread', '...[Array]', []],
]) cases.push([`observed/${ name }`, `return (function ({ from } = Object) {
  return [from([4])[0], arguments[0] === Array];
})(${ argument });`, [4, true], events]);
for (const [name, argument, events] of [
  ['omitted', '', []], ['undefined', 'undefined', []], ['void', 'void effects.push("argument")', ['argument']],
]) cases.push([`default/${ name }`, `return (function ({ from } = (effects.push("default"), Array)) {
  return [from([5])[0], arguments[0] === undefined];
})(${ argument });`, [5, true], [...events, 'default']]);
for (const invocation of ['make()', 'make?.()', 'new make()', 'make`tag`']) {
  for (const fallback of ['', ' = Object']) {
    cases.push([`invocation/${ invocation }/${ fallback }`, `function make() { effects.push("make"); return Array; }
return (({ from, length }${ fallback }) => [from([6])[0], length])(${ invocation });`, [6, 1], ['make']]);
  }
}
for (const argument of ['pick ? Array : Iterator', 'pick && Array', 'pick ? Array : undefined']) {
  for (const fallback of ['', ' = Object']) {
    // An observed selection retains native parameter reads; this assertion observes
    // argument identity independently of whether that native static is available.
    cases.push([`selection/${ argument }/${ fallback }`, `const pick = Math.random() < 2;
return (function ({ from }${ fallback }) { void from; return arguments[0] === Array; })(${ argument });`, true, []]);
  }
}
cases.push(
  ['custom', `const user = { from: value => value[0] + 1 };
return (function ({ from } = Array) { return [from([8]), arguments[0] === user]; })(user);`, [9, true], []],
  ['getter', `const user = { get from() { effects.push("get"); return () => 11; } };
return (function ({ from } = Array) { return [from(), arguments[0] === user]; })(user);`, [11, true], ['get']],
  ['throwing-invocation', `function make() { effects.push("make"); throw new RangeError(); }
try { return (({ from }) => from)(new make()); } catch (error) { return error.name; }`, 'RangeError', ['make']],
  ['nested-arrow-observer', `return (function ({ from } = Object) {
  const observe = () => arguments[0] === Array; return [from([12])[0], observe()];
})(Array);`, [12, true], []],
  ['outer-arrow-observer', `return (function (value) {
  return (({ from } = Object) => [from([13])[0], arguments[0] === value])(Array);
})(17);`, [13, true], []],
  ['global-argument', `return (function ({ Promise: P } = Object) {
  return [typeof P, arguments[0] === globalThis];
})(globalThis);`, ['function', true], []],
  ['instance-argument', `const rows = [4, 15]; return (function ({ at } = []) {
  return [at.call(rows, -1), arguments[0] === rows];
})(rows);`, [15, true], []],
  ['instance-string-argument', `const text = "ab"; return (function ({ at } = []) {
  return [at.call(text, -1), arguments[0] === text];
})(text);`, ['b', true], []],
  ['instance-length', `const rows = [4, 15]; return (function ({ at } = []) {
  return [at.call(rows, -1), arguments.length];
})(rows);`, [15, 1], []],
  ['instance-default', `return (function ({ at } = []) {
  return [at.call([4, 15], -1), arguments[0] === undefined];
})();`, [15, true], []],
  ['instance-arrow-observer', `const rows = [4, 15]; return (function ({ at } = []) {
  const observe = () => arguments[0] === rows; return [at.call(rows, -1), observe()];
})(rows);`, [15, true], []],
  ['instance-escape', `const rows = [4, 15]; function observe(args) { return args[0] === rows; }
return (function ({ at } = []) { return [at.call(rows, -1), observe(arguments)]; })(rows);`, [15, true], []],
  ['instance-write', `const rows = [4, 15]; return (function ({ at } = []) {
  arguments[0] = "ab"; return [at.call(rows, -1), arguments[0]];
})(rows);`, [15, 'ab'], []],
  ['instance-default-write', `const box = { row: [4, 15] };
return (function (first = (arguments[1].row = "ab"), { row: { at } }) {
  return [at.call(box.row, -1), arguments[1] === box];
})(undefined, box);`, ['b', true], []],
  ['instance-default-escape', `const box = { row: [4, 15] };
function change(args) { args[1].row = "ab"; }
return (function (first = change(arguments), { row: { at } }) {
  return [at.call(box.row, -1), arguments[1] === box];
})(undefined, box);`, ['b', true], []],
  ['written-static', `Array.from = () => 16;
return (function ({ from } = Object) { return [from(), arguments[0] === Array]; })(Array);`, [16, true], []],
  ['nonconstructible', `const make = () => Array;
try { return (({ from }) => from)(new make()); } catch (error) { return error.name; }`, 'TypeError', []],
  ['typed-argument', `var list = Array;
return (({ of } = Array) => of(14))((list as typeof Array)!);`, [14], []],
);
let index = 0;
try {
  for (const [name, body, expected, events] of cases) {
    const source = scenarioSource(`export const effects = []; export const r = (() => { ${ body } })();`);
    const typed = name === 'typed-argument';
    const filename = typed ? 'input.ts' : 'input.mjs';
    const babel = (await transformAsync(source, {
      filename, configFile: false, babelrc: false, parserOpts: { plugins: typed ? ['typescript'] : [] },
      plugins: [[babelPlugin, OPTIONS]],
    })).code;
    const plugin = createUnplugin(OPTIONS);
    const pre = plugin.transform(source, filename, 'pre')?.code ?? source;
    const post = plugin.transform(pre, filename, 'post')?.code ?? pre;
    const instanceEntry = name === 'instance-string-argument' ? 'string/instance/at'
      : ['instance-argument', 'instance-length', 'instance-default', 'instance-arrow-observer'].includes(name) ? 'array/instance/at'
        : ['instance-escape', 'instance-write', 'instance-default-write', 'instance-default-escape'].includes(name) ? 'instance/at' : null;
    if (instanceEntry) for (const [host, output] of [['babel', babel], ['unplugin', pre], ['pre+post', post]]) {
      check(`${ name }/${ host }/entry`, output.includes(`@core-js/pure/actual/${ instanceEntry }`), true);
    }
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
