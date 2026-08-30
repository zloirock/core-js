// Unit tests for a property both emitters have to hold and neither leg-parity nor a fixture can see:
// what an emitter prints for one statement must not depend on a statement that FOLLOWS it. the
// channels that spell a kept receiver run per claim and share per-file state (a memo registry, an
// alias verdict, a suppression mark), so a second copy of the same source can re-write what the first
// copy's verdict was keyed on - and the first copy then renders differently than it does alone. both
// legs can drift the same way, which is why the copies are compared to each other and to the
// isolated control rather than one leg against the other.
// the last row is the suite's own control: two copies that are NOT the same source must render
// differently, so a comparator that went blind fails here instead of passing everything.
import { createRequire } from 'node:module';
import { createChecker } from '../polyfill-provider/harness.mjs';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';

const { parseSync, transformAsync } = createRequire(import.meta.url)('@babel/core');

const { check, finish } = createChecker('statement-order-independence');

const PRELUDE = 'let g, v, out, k;\nfunction eff() {}\n';

// one representative per channel that spells a kept receiver: a plain probe nav, the stored value
// the probe writes, the same store behind a sequence, an effectful computed key, and an instance
// tail (whose memo is minted per site, so the compare has to fold those names)
const CASES = [
  ['plain probe nav', 'globalThis.window?.self'],
  ['stored probe', '(v = globalThis.window?.self)'],
  ['sequence store', '(g = globalThis, v = g.window?.self)'],
  ['sequence store, plain hop', '(g = globalThis, v = g.window.self)'],
  ['effectful key in the store', "(g = globalThis, v = g[(eff(), 'window')]?.self)"],
  ['const alias root', '(g = globalThis, v = g.self)'],
];

const CLAIM = '?.Number.MAX_SAFE_INTEGER';

const IGNORED = new Set(['start', 'end', 'loc', 'range', 'extra', 'leadingComments', 'trailingComments', 'innerComments', 'comments']);

// a memo name is minted per SITE, so the second copy holds `_ref2` where the first holds `_ref` -
// same shape, different token. everything else has to match exactly
function shape(node) {
  if (Array.isArray(node)) return node.map(shape);
  if (!node || typeof node !== 'object') return node;
  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (IGNORED.has(key)) continue;
    out[key] = key === 'name' && typeof value === 'string' ? value.replace(/^_ref\d*$/u, '_ref') : shape(value);
  }
  return out;
}

// the value each copy binds: the `out = ...` right-hand side, and the exported `twin` initializer
function copies(code) {
  // eslint-disable-next-line node/no-sync -- the checker is synchronous, and so is the compare it feeds
  const { program } = parseSync(code, { configFile: false, babelrc: false, sourceType: 'module' });
  let last = null;
  let first = null;
  let twin = null;
  for (const node of program.body) {
    if (node.type === 'ExpressionStatement' && node.expression?.type === 'AssignmentExpression'
      && node.expression.left?.name === 'out') last = JSON.stringify(shape(node.expression.right));
    const declaration = node.type === 'ExportNamedDeclaration' ? node.declaration : node;
    if (declaration?.type === 'VariableDeclaration') {
      for (const declarator of declaration.declarations) {
        if (declarator.id?.name === 'twin' && declarator.init) {
          twin = JSON.stringify(shape(declarator.init));
          first = last;
        }
      }
    }
  }
  return { first, twin };
}

const LEGS = [
  ['babel', async (source, options) => (await transformAsync(source, {
    configFile: false, babelrc: false, filename: 'input.mjs', plugins: [[babelPlugin, options]],
  })).code],
  ['unplugin', (source, options) => createUnplugin({ ...options }).transform(source, 'input.mjs')?.code ?? source],
];

for (const method of ['usage-pure', 'usage-global']) {
  const options = { method, version: '4.0', targets: { ie: 11 } };
  for (const [label, receiver] of CASES) {
    const claim = `${ receiver }${ CLAIM }`;
    const twice = `${ PRELUDE }out = ${ claim };\nexport const twin = ${ claim };\n`;
    const alone = `${ PRELUDE }out = ${ claim };\nexport const twin = 1;\n`;
    for (const [leg, transform] of LEGS) {
      const pair = copies(await transform(twice, options));
      const control = copies(await transform(alone, options));
      check(`${ method } ${ leg }: both copies render the same: ${ label }`, pair.first, pair.twin);
      check(`${ method } ${ leg }: a following copy does not change the first: ${ label }`,
        pair.first, control.first);
    }
  }

  // the control: the copies are DIFFERENT sources, so a comparator that still reports them equal is
  // blind and every row above is vacuous
  for (const [leg, transform] of LEGS) {
    const differing = `${ PRELUDE }out = globalThis.window?.self?.Number.MAX_SAFE_INTEGER;\n`
      + 'export const twin = globalThis.window?.self?.Array;\n';
    const pair = copies(await transform(differing, options));
    check(`${ method } ${ leg }: the comparator separates two different sources`,
      pair.first === pair.twin, false);
  }
}

finish();
