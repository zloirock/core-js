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
  for (const [label, source, tokens] of [
    // eslint-disable-next-line no-template-curly-in-string -- this is source text for the printer
    ['template interpolation', 'const a = 3; export const t = `a${/*before*/ (a /*inner*/) /*outside*/}b${a /*tail*/}`;',
      ['`a${', '/*before*/', 'a', '/*inner*/', '/*outside*/', '}b${', 'a', '/*tail*/', '}`']],
    ['default and namespace import', 'import /*before*/ d /*default*/, /*namespace*/ * as n from "pkg"; export { d, n };',
      ['import', '/*before*/', 'd', '/*default*/', '/*namespace*/', '*', 'as n', 'from']],
  ]) {
    let text = `${ source }\nArray.from([]);`;
    for (const stage of ['pre', 'post']) {
      text = createPlugin({ ...options, method: 'usage-pure' }).transform(text, '/comments.mjs', stage)?.code ?? text;
      // Start after generated imports. Each later token belongs to the same syntactic slot.
      let start = text.indexOf(tokens[0] === 'import' ? '/*before*/' : tokens[0]);
      for (const token of tokens.slice(tokens[0] === 'import' ? 1 : 0)) {
        const at = text.indexOf(token, start);
        checkTruthy(`${ label }/${ stage }/${ token }`, at !== -1);
        start = at + token.length;
      }
      const parsed = await parse('/comments.mjs', text);
      check(`${ label }/${ stage }/parses`, parsed.errors.length, 0);
      checkDeep(`${ label }/${ stage }/comments`, parsed.comments.map(comment => comment.value.trim()),
        tokens.filter(token => token.startsWith('/*')).map(token => token.slice(2, -2)));
    }
  }
  const babel = require('@babel/core');
  const lowerPattern = require('@babel/plugin-transform-destructuring');
  const lowerSpread = require('@babel/plugin-transform-object-rest-spread');
  const stripTypes = require('@babel/plugin-transform-typescript');
  {
    const input = 'for (const {\n// core-js-disable-next-line\nat,\n} of rows) use(at);';
    const plugin = createPlugin({ ...options, method: 'usage-global' });
    const single = plugin.transform(input, '/idle.mjs')?.code ?? input;
    check('single pass keeps the loop key directive in place', /\/\/ core-js-disable-next-line\s+at\b/.test(single), true);
    const pre = plugin.transform(input, '/idle.mjs', 'pre')?.code ?? input;
    const lowered = (await babel.transformAsync(pre, { configFile: false, babelrc: false, plugins: [lowerPattern] })).code;
    const post = plugin.transform(lowered, '/idle.mjs', 'post')?.code ?? lowered;
    check('paired lowering keeps the same loop read native', /es\.(?:array|string)\.at["']/.test(post), false);
    check('paired lowering retains one directive on the native read', post.match(/core-js-disable-/g)?.length, 1);
  }
  for (const method of ['usage-global', 'usage-pure']) {
    const plugin = createPlugin({ ...options, method });
    for (const gap of ['', '\n']) {
      const id = '/gap.ts';
      const source = `const obj = { a: 1 };\n// core-js-disable-next-line\n${ gap
      }export const copy = { ...obj };\nexport const witness = (obj.run<number>)?.(1);`;
      const pre = plugin.transform(source, id, 'pre')?.code ?? source;
      const lowered = (await babel.transformAsync(pre, {
        configFile: false, babelrc: false, filename: id, retainLines: true,
        assumptions: { setSpreadProperties: true }, plugins: [stripTypes, [lowerSpread, { useBuiltIns: true }]],
      })).code;
      const post = plugin.transform(lowered, id, 'post')?.code ?? lowered;
      const entry = method === 'usage-global' ? 'modules/es.object.assign' : 'actual/object/assign';
      check(`${ method }/spread opt-out gap=${ gap.length }`, post.includes(entry), Boolean(gap));
      check(`${ method }/spread directive count=${ gap.length }`, post.match(/core-js-disable-/g)?.length, 1);
    }
    for (const [label, header] of [
      ['for-of', 'for (const PATTERN of [Object]) sink(groupBy, fromEntries);'],
      ['classic', 'for (let PATTERN = Object; condition; ) sink(groupBy, fromEntries);'],
    ]) {
      const pattern = '{\n// core-js-disable-next-line\ngroupBy,\nfromEntries,\n}';
      const source = header.replace('PATTERN', pattern);
      const pre = plugin.transform(source, '/loop.mjs', 'pre')?.code ?? source;
      const lowered = (await babel.transformAsync(pre, {
        configFile: false, babelrc: false, filename: '/loop.mjs', plugins: [lowerPattern],
      })).code;
      const post = plugin.transform(lowered, '/loop.mjs', 'post')?.code ?? lowered;
      const result = await parse('/loop.mjs', post);
      const imports = result.program.body.filter(node => node.type === 'ImportDeclaration').map(node => node.source.value);
      const labelBase = `${ method }/loop directive/${ label }`;
      check(`${ labelBase }/disabled`, imports.some(value => value.endsWith('group-by')), false);
      check(`${ labelBase }/enabled`, imports.some(value => value.endsWith('from-entries')), true);
      const directives = result.comments.filter(comment => comment.value.includes('core-js-disable-'));
      // In pure for-of the loop also builds a mirror with its own native Object.groupBy read.
      // The lowered head and the mirror each keep one directive on the access they own.
      if (method === 'usage-pure' && label === 'for-of') {
        check(`${ labelBase }/native mirror read`, /core-js-disable-next-line\s+groupBy: Object\.groupBy/.test(post), true);
        check(`${ labelBase }/lowered head read`, /core-js-disable-next-line\s+const groupBy = _ref\.groupBy/.test(post)
          || /\b_ref\.groupBy\s*\/\/ core-js-disable-line/.test(post), true);
        check(`${ labelBase }/one directive per native read`, directives.length, 2);
      } else check(`${ labelBase }/single directive`, directives.length, 1);
      const added = post.replace('sink(groupBy, fromEntries);', '{\nObject.hasOwn({}, "x");\n}');
      const again = plugin.transform(added, '/loop.mjs', 'post')?.code ?? added;
      check(`${ labelBase }/new body use stays enabled`, again.includes(method === 'usage-pure' ? '/object/has-own' : 'es.object.has-own'), true);
    }
    for (const [label, pattern, values] of [
      ['literal', '{ KEY "groupBy": f,\nfromEntries }', '[Object]'],
      ['computed', '{ KEY ["groupBy"]: f,\nfromEntries }', '[Object]'],
      ['array', '[{ KEY groupBy: f,\nfromEntries }]', '[[Object]]'],
      ['array rest', '[...[{ KEY groupBy: f,\nfromEntries }]]', '[[Object]]'],
      ['assignment', '{ KEY groupBy: f,\nfromEntries }', '[Object]'],
    ]) {
      const directive = label === 'computed'
        ? '/* docs mention core-js-disable-next-line\n * core-js-disable-next-line custom implementation */'
        : '// core-js-disable-next-line custom implementation';
      const head = pattern.replace('KEY ', `\n${ directive }\n`);
      const start = label === 'assignment' ? 'let f, fromEntries; for (' : 'for (const ';
      const input = `${ start }${ head } of ${ values }) sink(f, fromEntries);\nObject.hasOwn(obj, "a");`;
      const pre = plugin.transform(input, '/loop.mjs', 'pre')?.code ?? input;
      const lowered = (await babel.transformAsync(pre, { configFile: false, babelrc: false, plugins: [lowerPattern] })).code;
      const post = plugin.transform(lowered, '/loop.mjs', 'post')?.code ?? lowered;
      const imports = (await parse('/loop.mjs', post)).program.body.filter(n => n.type === 'ImportDeclaration').map(n => n.source.value);
      const name = `${ method }/loop key/${ label }`;
      check(`${ name }/disabled groupBy`, imports.some(id => id.includes('group-by')), false);
      check(`${ name }/enabled hasOwn`, imports.some(id => id.includes('has-own')), true);
      check(`${ name }/directive explanation`, post.includes('custom implementation'), true);
      if (label === 'computed') check(`${ name }/quoted directive`, post.includes('docs mention core-js-disable-next-line'), true);
    }
  }
  for (const [label, loop] of [
    ['declaration', 'for (const { at /* key */: method, length } of [[1]]) use(method, length);'],
    ['assignment', 'let method; for ({ at /* key */: method } of [[1]]) ;'],
    ['nested', 'for (const { row: { at /* key */: method } } of [box]) use(method);'],
    ['braced', 'for (const { row: { at /* key */: method } } of [box]) { use(method); }'],
    ['native', 'for (const { custom /* key */: value } of [box]) use(value);'],
  ]) {
    let code = `${ loop } /* after */\nuse(0);`;
    const expected = commentSignature((await parse('input.mjs', code)).comments);
    for (const stage of ['pre', 'post']) {
      code = createPlugin({ ...options, method: 'usage-pure' }).transform(code, '/input.mjs', stage)?.code ?? code;
      checkDeep(`relocated head/${ label }/${ stage }`, commentSignature((await parse('input.mjs', code)).comments), expected);
    }
  }

  for (const [label, body, order] of [
    ['bare', '/* body */ a;', ['source', 'body', 'key', 'residual', 'after']],
    ['braced', '{ /* body */ a; }', ['source', 'key', 'residual', 'body', 'after']],
  ]) {
    let code = `for (const { at /* key */: a, length /* residual */ } of /* source */ [[1]]) ${ body } /* after */`;
    for (const stage of ['pre', 'post']) {
      code = createPlugin({ ...options, method: 'usage-pure' }).transform(code, '/input.mjs', stage)?.code ?? code;
      const { comments } = await parse('input.mjs', code);
      checkDeep(`loop binding ownership/${ label }/${ stage }`, comments.map(comment => comment.value.trim()), order);
    }
  }
  for (const [label, source, order] of [
    ['nested loop', 'for (const { y: { at /* key */: fn }, length } of /* source */ [box]) { /* body */ fn; }',
      ['source', 'key', 'body']],
    ['nested default', 'const { y: { at /* key */: fn = /*#__PURE__*/ magic() }, other } = box;',
      ['key', '#__PURE__']],
  ]) {
    let code = source;
    for (const stage of ['pre', 'post']) {
      code = createPlugin({ ...options, method: 'usage-pure' }).transform(code, '/input.mjs', stage)?.code ?? code;
      const { comments } = await parse('input.mjs', code);
      checkDeep(`nested binding ownership/${ label }/${ stage }`, comments.map(comment => comment.value.trim()), order);
    }
  }
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
