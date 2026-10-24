// The SAME program parsed two ways must transform the same way. Babel's default parser records a
// source paren on the wrapped node (`extra.parenthesized`) and drops the node; with
// `createParenthesizedExpressions` it keeps a `ParenthesizedExpression` NODE instead - the shape
// oxc always hands the other emitter. A predicate that reads a RAW node type therefore answers
// differently about one source, and the fixture corpus cannot see it: fixtures run this emitter on
// the default dialect only, while the shared provider's other consumer reaches the node shape
// through a route of its own. Comparison is structural (the outputs are re-parsed on the default
// dialect, so a paren the second run merely re-prints is not a difference) plus the import set.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { bindingLoopAnchor, lookupReadPath, pathOfNode } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from '../polyfill-provider/harness.mjs';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { parseAsync, parseSync, transformAsync, transformFromAstAsync } = requireBabel('@babel/core');

const { check, finish } = createChecker('parser-dialect-equivalence');

// positional noise a re-print carries; `extra` holds the paren bookkeeping itself
const IGNORED_FIELDS = new Set([
  'start',
  'end',
  'loc',
  'range',
  'extra',
  'leadingComments',
  'trailingComments',
  'innerComments',
  'comments',
]);

// nested SEQUENCES are printed differently by construction: the node dialect re-prints the source
// parens it kept (`(a, (b, c))`) where the flag dialect has no node to print (`a, b, c`). the comma
// operator associates either way in both order and value, so the shapes are flattened before the
// compare - an effect that MOVED or vanished still shows in the flat list
function flattenSequences(node) {
  if (Array.isArray(node)) return node.map(flattenSequences);
  if (!node || typeof node !== 'object') return node;
  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (!IGNORED_FIELDS.has(key)) out[key] = flattenSequences(value);
  }
  if (out.type !== 'SequenceExpression') return out;
  out.expressions = out.expressions.flatMap(expression => expression.type === 'SequenceExpression'
    ? expression.expressions
    : [expression]);
  return out;
}

// the outputs are compared as programs, not as text: both are re-parsed on the DEFAULT dialect,
// which drops source parens, so a paren that only survived the round trip is not a divergence -
// a dropped effect, a surviving hop or a different guard is
function structure(code, parserPlugins = []) {
  // eslint-disable-next-line node/no-sync -- the checker is synchronous, and so is the compare it feeds
  const { program } = parseSync(code, { configFile: false, babelrc: false, parserOpts: { plugins: parserPlugins } });
  return JSON.stringify(flattenSequences(program));
}

function imports(code) {
  return code.matchAll(/["'](?<source>(?:@core-js\/[^"'/]+|core-js(?:-pure)?)\/[^"']+)["']/gu)
    .map(match => match.groups.source).toArray().sort()
    .join(',');
}

// one representative per family that puts a wrapper between a decision and the node it reads:
// the effect-bearing sequence around a nav, the same inside a store, and the seal shapes whose
// decisions were already dialect-aware (they stay in the list as the negative half of the gate)
const CASES = [
  ['local reader through parenthesized callee and argument',
    'function pick<T extends { rows: unknown }>(o: T): T["rows"] { return o.rows; } const box = { rows: [8, 9] }; use(((pick))(((box))).at(-1));', ['typescript']],
  ['local reader after a wrapped argument write',
    'function pick<T extends { rows: unknown }>(o: T): T["rows"] { return o.rows; } '
      + 'const box: any = { rows: [8, 9] }; box.rows = "ab"; use(pick(((box as typeof box))).at(-1));', ['typescript']],
  ['local reader after a wrapped argument handout',
    'function pick<T extends { rows: unknown }>(o: T): T["rows"] { return o.rows; } const box = { rows: [8, 9] }; mutate(box); use(pick(((box!))).at(-1));', ['typescript']],
  ['positional capture before a later name rebind',
    'let value = [0, 2]; const [saved] = ([((value))]); value = "02"; export const r = saved.includes("02");'],
  ['constructor element with two prototype leaves',
    'for (const C of [((Array))]) { const { prototype: { at, includes } } = (C); use(at, includes); }'],
  ['nested constructor surface under a parenthesized element',
    'for (const { w: { prototype: { at, includes } } } of [(({ w: ((Array)) }))]) use(at, includes);'],
  ['typed constructor element with two prototype leaves',
    'for (const { prototype: { at, includes } } of [(Array as ArrayConstructor)]) use(at, includes);', ['typescript']],
  ['nested assignment off a parenthesized call',
    'const getBox = () => ({ data: [1, 2] }); let at; ({ data: { at } } = (getBox()));'],
  ['optional carrier method followed by an alias write',
    'const box = { data: [1, 2] }; const [alias] = ([box])?.map(x => x); alias.data = "xy"; export const r = box.data.includes("x");'],
  ['nested optional member extraction',
    'const wrap = { box: { data: [1, 2] } }; let at; ({ data: { at } } = (wrap?.box));'],
  ['ambient Flow instance under parentheses',
    'declare class C { m(): string } export const r = (((new C()).m)()).at(0);', ['flow']],
  ['ambient Flow generic rest in a rebuilt argument',
    'declare class C { m<T = number[]>(...xs: T[]): T } const values = []; values.push(((new C()).m("abc")).at(0));', ['flow']],
  ['ambient Flow optional callable',
    'declare class C { m?: () => string } export const r = (new C()).m?.().at(0);', ['flow']],
  ['ambient Flow inherited builtin',
    'declare class B extends Array<string> {} declare class C extends B {} export const r = ((new C())).at(0);', ['flow']],
  ['ambient Flow typeof under a function call',
    'declare class C { static m(): string } function read(f: typeof C.m) { return ((f)()).at(0); }', ['flow']],
  [
    'parenthesized array receiver with ordered reads and a default',
    'export function read(receiver, fallback) { const [{ other, at = fallback() }] = ([receiver]); return [at, other]; }',
  ],
  // the minifier-sequence split reads the statement through the paren the kept dialect adds around
  // the whole sequence and around each operand: the products, their order and the demoted string
  // head are one program on both dialects (a string operand PARENTHESIZED by the source is the
  // one documented dialect difference and stays out of this row)
  ['minifier sequence, nested operand and demoted head',
    'const src = [1, [2]];\nlet at, flat;\n("use strict", ({ at } = src), (eff(), ({ flat } = src)), use(at, flat));'],
  ['minifier sequence in an unbraced body', 'const src = [1, [2]];\nlet at;\nif (c) (eff(), ({ at } = src));'],
  ['served alias probe through a cast',
    'const held = globalThis.window; export const value = typeof ((held as any).Promise).resolve;', ['typescript']],
  ['nested seal probe and prefix through a cast',
    'const log: unknown[] = []; export const value = (log.push("prefix"), ((globalThis.window?.self) as any).Array).of(3);',
    ['typescript']],
  ['sequence-prefixed nav, claimless leaf', 'let c = 0;\nexport const r = (c++, globalThis.window.self).noSuchStatic;'],
  ['sequence-prefixed nav, instance claim',
    'let c = 0;\nexport const r = (c++, globalThis.window.self).Array.prototype.at;'],
  ['sequence-prefixed nav, static claim',
    'let c = 0;\nexport const r = (c++, globalThis.window.self).Number.MAX_SAFE_INTEGER;'],
  ['sequence-prefixed probe under delete',
    'let c = 0;\nexport const r = delete (c++, globalThis.window?.self).Number.MAX_SAFE_INTEGER;'],
  ['effect-bearing sequence inside a store',
    'let c = 0;\nlet v;\nexport const r = (v = (c++, globalThis.window.self)).Array.prototype.at;'],
  ['nested sequences inside a store',
    'let c = 0;\nlet v;\nexport const r = (v = (c++, (c++, globalThis.window.self))).Array.prototype.at;'],
  // a store a pattern's init keeps swaps the bare global it stores in the slot the sequence peel ended on
  ['kept store of a bare global behind an effect',
    'let kv;\nexport const { Array: { prototype: { keys: k } } } = (kv = (e1(), globalThis));'],
  ['kept store of a bare global behind nested effects',
    'let kv;\nexport const { Array: { prototype: { keys: k } } } = (kv = (e1(), (e2(), globalThis)));'],
  [
    'kept store of a cast bare global behind an effect',
    'let kv: any;\nexport const { Array: { prototype: { keys: k } } } = (kv = (e1(), globalThis as any));',
    ['typescript'],
  ],
  ['kept store of a parenthesized bare global',
    'let kv;\nexport const { Array: { prototype: { keys: k } } } = (kv = (globalThis));'],
  ['stored plain nav, ctor under a computed key',
    'let c = 0;\nlet k;\nlet v;\nexport const r = (v = (c++, globalThis.window.self))?.Promise[k].at;'],
  ['stored plain nav, static under a plain tail',
    'let c = 0;\nlet v;\nexport const r = (v = (c++, globalThis.window.self))?.Promise.race.zzz;'],
  ['stored probe under an optional consumer',
    'let c = 0;\nlet v;\nexport const r = (v = (c++, globalThis.window?.self))?.Promise.race;'],
  ['stored probe read for its own keys',
    'let c = 0;\nlet v;\nexport const { trunc: r } = (v = (c++, globalThis.window?.self)).Math;'],
  ['paren layer over the nav', 'export const r = (globalThis.window?.self).Array.of(1);'],
  ['chain assign below the hops', 'let v;\nexport const r = (v = globalThis).window.self.Array.from([1]);'],
  ['sealed tagged tag over the guarded nav', 'export const r = (globalThis.window?.self.someTag)`x`;'],
  ['sealed callee over the guarded nav', 'export const r = (globalThis.window?.self.userFn)();'],
  ['sealed callee, plain tail steps above the leaf', 'export const r = (globalThis.window?.self.aaa.bbb)();'],
  ['whole-sealed probe chain under delete', 'export const r = delete (globalThis.window?.self?.window.zzz);'],
  ['member off a sealed probe nav under delete', 'export const r = delete (globalThis.window?.self?.window).zzz;'],
  ['member off a sealed probe nav with a tail, under delete', 'export const r = delete (globalThis.window?.self?.window.aaa).zzz;'],
  ['call-rooted sealed chain under delete, unresolvable mid-hop',
    'const dh = () => globalThis;\nexport const r = delete (dh().window?.window?.self.zzz);'],
  ['call-rooted run under delete, paren between two hops',
    'const dh = () => globalThis;\nexport const r = delete (dh().window).self.zzz;'],
  // TS rows: the seal may be spelled through a wrapper stack, and a tag the plugin never touches
  // still owes the reprint its parens - the output must stay parseable on top of equivalent
  ['sealed tagged tag under a non-null wrapper', 'export const r = (globalThis.window?.self.someTag!)`x`;', ['typescript']],
  ['untouched optional-chain tag under a non-null wrapper, reprint only',
    'const q = [1].at(0);\nexport const r = (a?.b.tag!)`x`;', ['typescript']],
  // the cascade flattens the statement's paren NODE by re-seating that path onto the assignment; a
  // leaf dispatched after the flatten climbs through the shadow to the same statement
  ['assignment destructure, SE keys on two hops, pattern-valued static',
    'const log = [];\nlet from, l;\n({ Array: { [(log.push("f"), "from")]: from }, Object: { keys: { [(log.push("k"), "length")]: l } } } = globalThis);\n'
    + 'export const r = [from, l];'],
  // a member target the source parenthesizes is the same slot: the node dialect hands the write a
  // `ParenthesizedExpression`, which is no assignment target of its own
  ['parenthesized member target of a static claim', 'const sink = {};\n({ from: (sink.f) } = Array);\n({ of: (sink.g) = fallback } = Array);'],
  ['parenthesized defaulted binding target of a static claim', 'let f;\n({ fromAsync: (f) = fallback } = Array);'],
  ['parenthesized binding leaves of a captured hop',
    'let t, u, r1, r2;\n({ Array: { from: (t), ...r1 } } = globalThis);\n({ Array: { of: ((u)) = fallback, ...r2 } } = globalThis);'],
  ['parenthesized targets under a nested rest keep the inline default',
    'const o = {};\nlet r1, r2, g, f;\n({ Array: { from: (o.f), ...r1 } } = globalThis);\n({ Array: { [k]: g, of: (f), ...r2 } } = globalThis);'],
  ['parenthesized binding targets of static, instance, rest and effect-keyed claims',
    'let f, a, g, r, h;\n({ from: (f) } = Array);\n({ at: (a) } = arr);\n({ of: (g), ...r } = Array);\n({ [(e(), "from")]: (h) } = Array);'],
  ['parenthesized cast member target of a static claim', 'const sink: any = {};\n({ from: ((sink.f as any)) } = Array);', ['typescript']],
  ['parenthesized member target of an instance claim', 'const sink = {};\n({ at: (sink.m) } = arr);\n({ y: { flat: (sink.n) } } = { y: arr });'],
  ['mixed inner default under a parenthesized slot',
    'const held = { Set: class {}, Array: { of: x => [x] } };\nexport const r = (([{ Set: S, Array: { of } } = globalThis]) => [S, of(7)])([(held)]);'],
];

for (const method of ['usage-pure', 'usage-global']) {
  function config(parserOpts, parserPlugins) {
    return {
      configFile: false,
      babelrc: false,
      parserOpts: { plugins: parserPlugins, ...parserOpts },
      plugins: [[babelPlugin, { method, version: '4.0', targets: { ie: 11 } }]],
      filename: parserPlugins.length ? 'input.ts' : 'input.mjs',
    };
  }

  for (const [label, source, parserPlugins = []] of CASES) {
    const flag = (await transformAsync(source, config({}, parserPlugins))).code;
    const node = (await transformAsync(source, config({ createParenthesizedExpressions: true }, parserPlugins))).code;
    check(`${ method }: one program, both paren dialects: ${ label }`, structure(node, parserPlugins), structure(flag, parserPlugins));
    check(`${ method }: same import set in both dialects: ${ label }`, imports(node), imports(flag));
  }
}

// Reusing one source tree in another File keeps node identity, not the earlier File's scope.
{
  const source = 'export function read(local) { const box = { first: globalThis, second: globalThis }; return box; }';
  const ast = await parseAsync(source, { configFile: false, babelrc: false });
  let original;
  let hub;
  await transformFromAstAsync(ast, source, {
    cloneInputAst: false, configFile: false, babelrc: false, code: false,
    plugins: [() => ({ visitor: { Program(program) {
      const fn = program.get('body')[0].get('declaration');
      original = fn.node.body.body[0].declarations[0].init.properties[0].value;
      hub = program.hub;
      const sourcePath = pathOfNode(fn, original);
      check('source path first File has no parameter shadow', bindingLoopAnchor(sourcePath.scope.getBinding('globalThis')).decl, null);
      check('source path first File retains its node', sourcePath.node, original);
    } } })],
  });
  // Clear native caches so the second File owns fresh paths over the same parsed nodes.
  requireBabel('@babel/traverse').default.cache.clear();
  ast.program.body[0].declaration.params[0].name = 'globalThis';
  await transformFromAstAsync(ast, source, {
    cloneInputAst: false, configFile: false, babelrc: false, code: false,
    plugins: [() => ({ visitor: { Program(program) {
      const fn = program.get('body')[0].get('declaration');
      const literal = fn.get('body').get('body')[0].get('declarations')[0].get('init');
      const native = literal.get('properties')[0].get('value');
      check('source path second File has a new native owner', program.hub !== hub, true);
      check('source path second File retains source identity', native.node, original);
      check('source path native binding is the parameter', bindingLoopAnchor(native.scope.getBinding('globalThis')).decl, fn.node.params[0]);
      const cached = pathOfNode(fn, original);
      check('source path cached value uses the new File binding', bindingLoopAnchor(cached.scope.getBinding('globalThis')).decl, fn.node.params[0]);
      const sibling = pathOfNode(fn, literal.node.properties[1].value);
      check('source path uncached sibling uses current containers', bindingLoopAnchor(sibling.scope.getBinding('globalThis')).decl, fn.node.params[0]);
      const apart = lookupReadPath(fn.get('body').get('body')[1].get('argument'), original);
      check('source path apart lookup uses the new File binding', bindingLoopAnchor(apart.scope.getBinding('globalThis')).decl, fn.node.params[0]);
    } } })],
  });
}

finish();
