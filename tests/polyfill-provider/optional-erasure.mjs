// Source receivers need both a replacement claim and a defined value. A live hop
// keeps the whole receiver spelling, including otherwise redundant optionals.
import { vestigialReceiverOptionals } from '../../packages/core-js-polyfill-provider/detect-usage/annotations.js';
import { isVestigialOptionalHop, vestigialNavOptionals } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { unwrapRuntimeExpr, walkAstNodes } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('optional-erasure');

function resolve(meta) {
  if (meta.kind === 'global' && ['globalThis', 'self', 'Array', 'Promise'].includes(meta.name)) return { kind: 'global' };
  return meta.object === 'Array' && meta.key === 'from' ? { kind: 'static' } : null;
}

for (const [name, source, expected, mutated = []] of [
  ['plain', 'const value = globalThis.self;', []],
  ['root', 'const value = globalThis?.self;', ['self']],
  ['backed hop', 'const value = globalThis.self?.Array;', ['Array']],
  ['computed hop', 'const value = globalThis["self"]?.Array;', ['Array']],
  ['static claim', 'const value = Array?.from;', ['from']],
  ['unknown value', 'const value = unknown?.self;', []],
  ['unknown call', 'const value = unknown()?.self;', []],
  ['stored null', 'let held; const value = (held = null)?.self;', []],
  ['stored realm', 'let held; const value = (held = globalThis)?.self;', ['self']],
  ['stored probe', 'let held; const value = (held = globalThis.window)?.self;', []],
  ['stored prefix', 'let held; const value = (held = (effect(), globalThis))?.self;', ['self']],
  ['alias', 'const realm = globalThis; const value = realm?.self;', ['self']],
  ['alias probe', 'const realm = globalThis.window; const value = realm?.self;', []],
  ['stored alias', 'let held; const realm = globalThis; const value = (held = realm)?.self;', ['self']],
  ['replaced alias', 'let realm = globalThis; realm = unknown; const value = realm?.self;', []],
  ['shadow', 'function read(globalThis) { const value = globalThis?.self; }', []],
  ['bare call probe', 'const realm = () => globalThis; const value = realm()?.self;', []],
  ['stored call', 'let held; const realm = () => globalThis; const value = (held = realm())?.self;', ['self']],
  ['literal call probe', 'const value = (() => globalThis)()?.self;', []],
  ['stored conditional void', 'let held; const realm = () => flag ? globalThis : undefined; const value = (held = realm())?.self;', []],
  ['prefix', 'const value = (effect(), globalThis)?.self;', ['self']],
  ['nested prefix', 'let held; const value = (effect(), (other(), held = globalThis))?.self;', []],
  ['live above dead', 'const value = globalThis?.unknown?.self;', []],
  ['live below dead', 'let held; const value = (held = globalThis.window)?.self?.Array;', []],
  ['all dead', 'const value = globalThis?.self?.Array;', ['Array', 'self']],
  ['below invocation', 'const value = globalThis?.Array.from([1]);', ['Array']],
  ['mutated surface', 'const value = globalThis.self?.Array;', [], ['globalThis.self']],
  ['mutated constructor', 'const value = Array?.from;', [], ['globalThis.Array']],
]) runBoth(name, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const object = unwrapRuntimeExpr(path.node.init);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure', getMutatedStatics: () => new Set(mutated) });
  const options = {
    object,
    scope: path.scope,
    adapter,
    path,
    resolve(meta) {
      // Both emitters filter a mutated global or static before returning a replacement.
      if (adapter.isMutatedStatic(meta.kind === 'global' ? 'globalThis' : meta.object,
        meta.kind === 'global' ? meta.name : meta.key)) return null;
      return resolve(meta);
    },
  };
  const before = JSON.stringify(object);
  const slots = vestigialReceiverOptionals(options);
  checkDeep(label, slots.map(hop => hop.property.name), expected);
  const sourceNodes = new Set();
  walkAstNodes({ root: object, visit: node => { sourceNodes.add(node); } });
  check(`${ label }/returns source slots`, slots.every(hop => sourceNodes.has(hop) && hop.optional), true);
  check(`${ label }/read-only`, JSON.stringify(object), before);
  checkDeep(`${ label }/independent query`, vestigialReceiverOptionals(options), slots);
  checkDeep(`${ label }/own guard keeps receiver`, vestigialReceiverOptionals({ ...options, memberOptional: true }), []);
  checkDeep(`${ label }/unavailable replacement keeps guard`, vestigialReceiverOptionals({ ...options, resolve: () => null }), []);
});

// The value proof is queried for a single hop during descent and for the full
// claimed navigation during rendering. It must not resolve any non-optional link.
for (const [expression, expected, count] of [
  ['globalThis.self.Array', false, 0],
  ['globalThis?.self?.Array', true, 2],
  ['(held = globalThis.window)?.self', false, 0],
]) {
  runBoth(`value proof/${ expression }`, `let held; const value = ${ expression };`, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
    const node = unwrapRuntimeExpr(path.node.init);
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const ctx = { scope: path.scope, adapter, path };
    check(label, isVestigialOptionalHop(node, resolve, ctx), expected);
    check(`${ label }/selected hops`, vestigialNavOptionals(node, resolve, ctx).length, count);
    if (!node.optional) checkDeep(`${ label }/cheap refusal`, vestigialNavOptionals(node, () => {
      throw new Error('non-optional navigation must not resolve');
    }, ctx), []);
  });
}

finish();
