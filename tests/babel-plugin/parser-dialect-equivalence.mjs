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
import { createChecker } from '../polyfill-provider/harness.mjs';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { parseSync, transformAsync } = requireBabel('@babel/core');

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
  // the minifier-sequence split reads the statement through the paren the kept dialect adds around
  // the whole sequence and around each operand: the products, their order and the demoted string
  // head are one program on both dialects (a string operand PARENTHESIZED by the source is the
  // one documented dialect difference and stays out of this row)
  ['minifier sequence, nested operand and demoted head',
    'const src = [1, [2]];\nlet at, flat;\n("use strict", ({ at } = src), (eff(), ({ flat } = src)), use(at, flat));'],
  ['minifier sequence in an unbraced body', 'const src = [1, [2]];\nlet at;\nif (c) (eff(), ({ at } = src));'],
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
  // TS rows: the seal may be spelled through a wrapper stack, and a tag the plugin never touches
  // still owes the reprint its parens - the output must stay parseable on top of equivalent
  ['sealed tagged tag under a non-null wrapper', 'export const r = (globalThis.window?.self.someTag!)`x`;', ['typescript']],
  ['untouched optional-chain tag under a non-null wrapper, reprint only',
    'const q = [1].at(0);\nexport const r = (a?.b.tag!)`x`;', ['typescript']],
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

finish();
