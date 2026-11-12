// Printing must preserve grammar roles and type/import metadata, including without a rewrite.
/* eslint-disable max-depth -- Cross syntax/host/stage axes without hiding failures behind shared state. */
import { parse } from 'oxc-parser';
import { runInNewContext } from 'node:vm';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { LEAST_UPPER_BOUND, TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';
import { printProgram } from '../../packages/core-js-unplugin/internals/print.js';
import createPlugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { commentSignature, strip } from './structural.mjs';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';

const { check, checkDeep, checkTruthy, fail, finish } = createChecker('printer-boundaries');
const requireIntegration = createRequire(new URL('../transpiler-integration/package.json', import.meta.url));
const require = createRequire(import.meta.url);
const { transform } = await import(pathToFileURL(requireIntegration.resolve('rolldown/experimental')).href);
const options = { version: '4.0', targets: { ie: 11 } };
const execute = promisify(execFile);
const typed = [
  ['type-import-options', 'export type Value = typeof import("pkg", { with: { "resolution-mode": "import" } }).default;'],
  ['enum-key', 'enum Kind { [`value`] = 2 }'],
  ['static-index', 'class Bag { static readonly [key: string]: number; }'],
  ['method-order', `declare class Base { protected static make(): void; }
    abstract class Box extends Base { protected abstract read(): number; public abstract get size(): number; protected static override make() {} }`],
  ['decorated-method', 'class Base { static make() {} } class Box extends Base { @dec public static override make() {} @dec private static async *rows() { yield 1; } }'],
  ['export-instantiation', 'export default (function hidden<T>(x: T) { return x; })<number>;'],
  ['export-assertion', 'export default (function hidden() {}) as Function;'],
  ['nested-type-import', 'export type Value = import("pkg", { with: { "resolution-mode": "import" } }).Box<import("next", { with: { "resolution-mode": "require" } }).Value>;'],
];
const phases = [
  ['deferred', 'import defer * as ns /* tail */ from "pkg"; export const read = () => ns.value;'],
  ['source', 'import source wasm /* tail */ from "pkg"; export { wasm };'],
  ['dynamic', 'export const read = () => import.defer("pkg"); export const bytes = () => import.source("pkg");'],
  ['eager-control', 'import value /* tail */ from "pkg"; export const read = () => import("pkg", { with: { type: "json" } });'],
];
const scripts = [
  ['let-member', 'var let = [0]; (let[0] = 7); result = let[0];', 7],
  ['let-sealed-member', 'var let = [0]; (let)[0] = 7; result = let[0];', 7],
  ['let-loop', 'var let; for ((let) of [7]) ; result = let;', 7],
  ['async-loop', 'var async; for ((async) of [7]) ; result = async;', 7],
  ['let-in', 'var let = []; for ((let)[0] in { value: 1 }) ; result = let[0];', 'value'],
  ['let-call-control', 'var let = () => 7; result = let();', 7],
  ['nested-let-member', 'function read() { var let = [0]; (let[0] = 7); return let[0]; } result = read();', 7],
  ['bare-let-control', 'var let = 7; let; result = let;', 7],
  ['async-in-control', 'var async; for (async in { value: 1 }) ; result = async;', 'value'],
];
const exports = [
  ['named-function', 'export default (function hidden() { return [7].at(0); }); export const r = typeof hidden;', 'undefined'],
  ['named-class', 'export default (class Hidden { read() { return [7].at(0); } }); export const r = typeof Hidden;', 'undefined'],
  ['same-name', 'const same = 7; export default (function same() { return [7].at(0); }); export const r = same;', 7],
  ['logical', 'export default (function hidden() { return [7].at(0); }) || 0; export const r = typeof hidden;', 'undefined'],
  ['conditional', 'export default (class Hidden {}) ? [7].at(0) : 0; export const r = typeof Hidden;', 'undefined'],
  ['member', 'export default (function hidden() { return [7].at(0); }).name; export const r = typeof hidden;', 'undefined'],
  ['call', 'export default (function hidden() { return [7].at(0); })(); export const r = typeof hidden;', 'undefined'],
  ['declaration-control', 'export default function visible() { return [7].at(0); } export const r = typeof visible;', 'function'],
  ['new-control', 'export default new (class Hidden {})(); export const r = [7].at(0);', 7],
  ['async-function', 'export default (async function hidden() { return [7].at(0); }); export const r = typeof hidden;', 'undefined'],
  ['generator-function', 'export default (function* hidden() { yield [7].at(0); }); export const r = typeof hidden;', 'undefined'],
  ['module-async-loop', 'let async; for ((async) of [7]) ; export const r = [async].at(0);', 7],
  ['sequence', 'export default (function hidden() {}, [7].at(0)); export const r = typeof hidden;', 'undefined'],
  ['tag', 'export default (function hidden() { return [7].at(0); })``; export const r = typeof hidden;', 'undefined'],
  ['binary', 'export default (class Hidden {}) === 0; export const r = [typeof Hidden].at(0);', 'undefined'],
  ['unary-control', 'export default typeof function hidden() {}; export const r = [typeof hidden].at(0);', 'undefined'],
  ['arrow-object', 'const read = () => ({ value: 7 } || {}); export const r = [read().value].at(0);', 7],
  ['arrow-new-control', 'const read = () => new (class {})(); export const r = [typeof read()].at(0);', 'object'],
];
const directory = await fs.mkdtemp(path.join(import.meta.dirname, '../transpiler-differential/tmp/printer-boundaries-'));
let serial = 0;
try {
  for (const [source, marker, lang] of [
    ['export default (function sourceName() {});', 'sourceName', 'js'],
    ['import defer * as sourceName from "pkg";', 'sourceName', 'js'],
    ['import * as sourceName from "pkg";', 'sourceName', 'js'],
    ['import source sourceName from "pkg";', 'sourceName', 'js'],
    ['abstract class Box { protected abstract sourceName(): void; }', 'sourceName', 'ts'],
    ['class Box { static [sourceName: string]: number; }', 'sourceName', 'ts'],
  ]) {
    const id = `/map.${ lang }`;
    const parsed = await parse(id, source, { lang, preserveParens: true });
    const { code, map } = printProgram({ program: parsed.program, comments: parsed.comments, source, id });
    const before = code.slice(0, code.indexOf(marker)).split('\n');
    const position = originalPositionFor(new TraceMap(map), { line: before.length, column: before.at(-1).length, bias: LEAST_UPPER_BOUND });
    checkDeep(`map/${ source }`, [position.line, position.column], [1, source.indexOf(marker)]);
  }
  for (const [kind, rows, lang, sourceType] of [
    ['typed', typed, 'ts', 'module'], ['phase', phases, 'js', 'module'],
    ['script', scripts, 'js', 'script'], ['export', exports, 'js', 'module'],
  ]) for (const [name, source, want] of rows) {
    const id = `/printer-${ name }.${ lang === 'ts' ? 'ts' : sourceType === 'script' ? 'cjs' : 'mjs' }`;
    const parsed = await parse(id, source, { lang, sourceType, preserveParens: true });
    check(`${ name }/input parses`, parsed.errors.length, 0);
    const expected = strip(parsed.program);
    const { code: printed } = printProgram({ program: parsed.program, comments: parsed.comments, source, id });
    const reparsed = await parse(id, printed, { lang, sourceType, preserveParens: true });
    check(`${ name }/print parses`, reparsed.errors.length, 0);
    checkDeep(`${ name }/AST`, strip(reparsed.program), expected);
    checkDeep(`${ name }/comments`, commentSignature(reparsed.comments), commentSignature(parsed.comments));
    if (!reparsed.errors.length) check(`${ name }/idempotent`, printProgram({ program: reparsed.program,
      comments: reparsed.comments, source: printed, id }).code, printed);
    const outputs = [['native', source], ['print', printed]];
    for (const method of ['entry-global', 'usage-global', 'usage-pure']) {
      const input = `${ sourceType === 'script' ? '' : 'export {};' }\n${ source }\n${ method === 'entry-global'
        ? sourceType === 'script' ? 'require("core-js/actual/array/at");' : 'import "core-js/actual/array/at";'
        : '[7].at(0);' }`;
      const plugin = createPlugin({ ...options, method });
      let code = input;
      for (const stage of method === 'entry-global' ? ['pre'] : ['pre', 'post']) {
        try {
          const result = plugin.transform(code, id, stage);
          checkTruthy(`${ name }/${ method }/${ stage }/map`, !result || result.code === code || result.map.sourcesContent?.includes(code));
          code = result?.code ?? code;
          const outputAST = await parse(id, code, { lang, sourceType });
          check(`${ name }/${ method }/${ stage }/parses`, outputAST.errors.length, 0);
          if (kind === 'phase') checkDeep(`${ name }/${ method }/${ stage }/phases`,
            JSON.stringify(outputAST.program).match(/"phase":"\w+"/g), JSON.stringify(expected).match(/"phase":"\w+"/g));
          else if (kind === 'typed') {
            const lowered = await transform('printer.ts', code);
            check(`${ name }/${ method }/${ stage }/lowering`, lowered.errors.length, 0);
          }
          outputs.push([`${ method }/${ stage }`, code]);
        } catch (error) { fail(`${ name }/${ method }/${ stage }`, error.message); }
      }
    }
    if (kind === 'script') for (const [label, code] of outputs) {
      try {
        check(`${ name }/${ label }/runtime`, runInNewContext(`${ code }; result;`, { require }), want);
      } catch (error) { fail(`${ name }/${ label }/runtime`, error.message); }
    }
    else if (kind === 'export') for (const [label, code] of outputs) {
      const file = path.join(directory, `case-${ serial++ }.mjs`);
      await fs.writeFile(file, `${ code }\nexport const effects = [];`);
      check(`${ name }/${ label }/runtime`, await runInWorker(file, { strip: false }), `OK|${ JSON.stringify(want) }|[]`);
    }
  }
  // Host support is independent of parser support. Older Node still runs every AST check above.
  await fs.writeFile(path.join(directory, 'setup.mjs'), 'globalThis.phaseLog = [];');
  await fs.writeFile(path.join(directory, 'lazy.mjs'), 'globalThis.phaseLog.push("loaded"); export const value = 7;');
  await fs.writeFile(path.join(directory, 'empty.wasm'), new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]));
  for (const [phase, flags] of [['defer', ['--js-defer-import-eval']], ['source', []]]) {
    try { await execute(process.execPath, [...flags, '--input-type=module', '-e', `const read = () => import.${ phase }("unused");`]); } catch {
      echo(`printer-boundaries: Node ${ process.versions.node } does not execute import.${ phase }; AST checks remain mandatory`);
      continue;
    }
    // Node parses dynamic defer but its loader can fail even on the native source.
    // Its phase is held by the strict AST checks above; source imports execute both forms.
    for (const dynamic of phase === 'defer' ? [false] : [false, true]) {
      const source = phase === 'defer'
        ? `import './setup.mjs'; ${ dynamic ? 'const ns = await import.defer("./lazy.mjs");' : 'import defer * as ns from "./lazy.mjs";' }
          globalThis.phaseLog.push('before'); globalThis.phaseLog.push(ns.value); console.log(JSON.stringify(globalThis.phaseLog)); [7].at(0);`
        : `${ dynamic ? 'const wasm = await import.source("./empty.wasm");' : 'import source wasm from "./empty.wasm";' }
          console.log(JSON.stringify(wasm instanceof WebAssembly.Module)); [7].at(0);`;
      const want = phase === 'defer' ? '["before","loaded",7]' : 'true';
      for (const method of ['native', 'usage-global', 'usage-pure']) {
        const plugin = method === 'native' ? null : createPlugin({ ...options, method });
        let code = source;
        for (const stage of plugin ? ['pre', 'post'] : ['native']) {
          code = plugin?.transform(code, '/phase.mjs', stage)?.code ?? code;
          const file = path.join(directory, `phase-${ serial++ }.mjs`);
          await fs.writeFile(file, code);
          try {
            const { stdout } = await execute(process.execPath, [...flags, file]);
            check(`${ phase }/${ dynamic }/${ method }/${ stage }/evaluation`, stdout.trim(), want);
          } catch (error) { fail(`${ phase }/${ dynamic }/${ method }/${ stage }/evaluation`, error.message); }
        }
      }
    }
  }
} finally {
  await fs.rm(directory, { recursive: true, force: true });
}
finish();
