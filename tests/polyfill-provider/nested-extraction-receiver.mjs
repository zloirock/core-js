// Source lifetime, not parser dialect, determines which nested receiver can be saved.
import { planAssignmentOverwrite, planLiteralRoute } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { planRetainedObjectCapture } from '../../packages/core-js-polyfill-provider/destructure-host-shape.js';
import { identifier, hostSlot, renderNestedExtractionReceiver } from '../../packages/core-js-polyfill-provider/render.js';
import { resolveNestedReceiverPlan, resolveDestructureReceiverPlan } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import estreeToBabel from '../../packages/core-js-babel-plugin/internals/estree-to-babel.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('nested-extraction-receiver');
function resolveGlobalPolyfill(name) {
  return ['globalThis', 'Array', 'Symbol'].includes(name) ? { entry: name } : null;
}

function resolveStaticPolyfill(object, key) {
  return object === 'Array' && key === 'from' ? { entry: 'array/from' } : null;
}

for (const [name, source, expected] of [
  ['plain', 'let method; ({ y: { at: method } } = { y: rows });', ['receiver', 'receiver']],
  ['carried', 'let method; ({ y: { at: method } } = { y: make() });', ['receiver', 'receiver']],
  ['user nav', 'let method; ({ y: { at: method } } = source);', ['receiver', 'receiver']],
  ['computed root', 'let method; ({ y: { at: method } } = source());', ['receiver', 'receiver']],
  ['own this', 'function read() { let method; ({ y: { at: method } } = this); }', ['receiver', 'receiver']],
  ['realm user nav', 'let method; ({ y: { at: method } } = globalThis);', ['receiver', 'receiver']],
  ['static', 'let method; ({ Array: { from: { name: method } } } = globalThis);', ['receiver', 'receiver']],
  ['static default', 'let method; ({ Array: { from: { name: method } = fallback() } } = globalThis);', ['receiver', null]],
  ['surface', 'let method; ({ Array: { prototype: { at: method } } } = globalThis);', ['receiver', 'receiver']],
  ['mutable alias', 'let source = globalThis; source = foreign; let method; ({ y: { at: method } } = source);', ['receiver', 'receiver']],
  ['kept user getter', 'let method, kept; ({ y: { at: method, length: kept } } = source);', [null, null]],
  ['kept outer getter', 'let method, kept; ({ y: { at: method }, kept } = source);', [null, null]],
  ['rest', 'let method, rest; ({ y: { at: method, ...rest } } = source);', [null, null]],
  ['live default', 'let method; ({ y: { at: method } = fallback() } = source);', [null, null]],
  ['positional', 'let method; ([{ at: method }] = source);', [null, null]],
  ['surface defaulted symbol', 'let method; ({ Array: { [Symbol.iterator]: method = fallback() } } = globalThis);', [null, null]],
]) runBoth(name, source, (parser, program, label) => {
  const path = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', item => {
    const { value } = item.node;
    return value?.name === 'method' || value?.left?.name === 'method';
  });
  const assignment = parser.pickPath(program, 'AssignmentExpression').node;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, path, adapter, resolveGlobalPolyfill, resolveStaticPolyfill, isOwnAlias: () => false };
  const entry = path.node.computed ? 'get-iterator-method' : 'instance/at';
  const before = JSON.stringify(program.node);
  for (const pending of [false, true]) {
    const tag = `${ label }/${ pending ? 'pending' : 'rendered' }`;
    const input = { path, assignment, entry, pending };
    const plan = planAssignmentOverwrite(input, ctx);
    check(`${ tag }/admission`, plan?.kind ?? null, expected[Number(pending)]);
    checkDeep(`${ tag }/repeat`, planAssignmentOverwrite(input, ctx), plan);
    check(`${ tag }/source unchanged`, JSON.stringify(program.node), before);
    if (!plan) continue;
    check(`${ tag }/carries initializer`, !!plan.carriesInit,
      ['carried', 'user nav', 'computed root', 'own this', 'realm user nav', 'mutable alias'].includes(name));
    check(`${ tag }/refreshes live child`, !!plan.refresh, name === 'carried' && pending);
    if (name.startsWith('static')) check(`${ tag }/static ponyfill`, plan.pure.entry, 'array/from');
    else if (name === 'mutable alias') {
      check(`${ tag }/keeps written root`, plan.node.name, 'source');
      check(`${ tag }/no realm substitution`, !!plan.pure, false);
    }
    if (name === 'realm user nav') check(`${ tag }/realm ponyfill`, plan.pure.entry, 'globalThis');
    if (name.endsWith('nav') || name === 'computed root' || name === 'own this') checkDeep(`${ tag }/user keys`, plan.keys, ['y']);
    let imported = 0;
    let embedded = 0;
    const rendered = renderNestedExtractionReceiver(plan, {
      embed() { embedded++; return identifier('source'); },
      importPure() { imported++; return identifier('pure'); },
    });
    check(`${ tag }/one root`, imported + embedded, 1);
    check(`${ tag }/pure root`, imported, plan.pure ? 1 : 0);
    check(`${ tag }/rendered keys`, rendered.type, plan.keys.length ? 'MemberExpression' : 'Identifier');
  }
});

// The early retained-pattern plan owns the capture shape. Retaining a rest sibling
// does not serve its native instance read; the late overwrite cannot recapture it.
for (const [name, pattern, init, inline] of [
  ['inner sibling', '{ y: { at: method, length: kept } }', '{ y: holder.rows }', false],
  ['outer sibling', '{ y: { at: method }, kept }', '{ y: holder.rows, kept: 1 }', true],
  ['rest keeps capture', '{ y: { at: method, ...rest } }', '{ y: holder.rows }', false],
]) runBoth(name, `let method, kept, rest; (${ pattern } = ${ init });`, (parser, program, label) => {
  const path = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
    item => item.node.value?.name === 'method');
  const hostPath = parser.pickPath(program, 'AssignmentExpression');
  const assignment = hostPath.node;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, path, adapter, resolveGlobalPolyfill, resolveStaticPolyfill, isOwnAlias: () => false };
  const input = {
    path, assignment, entry: 'instance/at', pending: true,
  };
  const before = JSON.stringify(program.node);
  const captureInput = {
    pattern: assignment.left, init: assignment.right, assignment: true, prop: path.node, hostPath,
    adapter, kind: 'instance', entry: 'instance/at', meta: { kind: 'property', key: 'at' },
    resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'instance/at' } : null,
  };
  const plan = planRetainedObjectCapture(captureInput);
  check(`${ label }/capture`, !!plan?.capture, true);
  check(`${ label }/inline leaf`, plan?.capture?.inlineLeaf ?? null, inline);
  const repeated = planRetainedObjectCapture(captureInput);
  check(`${ label }/repeat capture`, !!repeated?.capture, true);
  check(`${ label }/repeat source slot`, repeated?.capture?.leafPattern, plan?.capture?.leafPattern);
  check(`${ label }/no late recapture`, planAssignmentOverwrite(input, ctx), null);
  check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
});

// Navigation carries its native source root separately from canonical computed members.
for (const key of ['"m-q"', '0', '["m-q"]', '[`m-q`]']) for (const root of ['box', 'box.inner', 'box?.inner']) {
  const source = `const { s: { ${ key }: { flat: method } } } = { s: ${ root } };`;
  runBoth(`native navigation/${ key }/${ root }`, source, (parser, program, label) => {
    const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', item => item.node.value?.name === 'method');
    const host = parser.pickPath(program, 'VariableDeclarator');
    const sourceRoot = host.node.init.properties[0].value;
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const before = JSON.stringify(program.node);
    const plan = resolveNestedReceiverPlan(prop, { allowNavSegments: true, allowSeFreeSingleRead: true, adapter });
    check(`${ label }/source root identity`, unwrapRuntimeExpr(plan?.node), unwrapRuntimeExpr(sourceRoot));
    checkDeep(`${ label }/canonical keys`, plan?.keys, [key === '0' ? '0' : 'm-q']);
    const receiver = resolveDestructureReceiverPlan(prop, { allowSeFreeSingleRead: true, adapter });
    check(`${ label }/resolved channel`, receiver.channel, 'resolved');
    check(`${ label }/receiver carries source root`, unwrapRuntimeExpr(receiver.navigation?.node), unwrapRuntimeExpr(sourceRoot));
    check(`${ label }/analysis retains its source projection`, receiver.node.object, unwrapRuntimeExpr(sourceRoot));
    const literal = planLiteralRoute({
      metaPath: prop, prop: prop.node, kind: 'instance', entry: 'instance/flat',
      declarator: host.node, declaration: host.parentPath.node, adapter,
    });
    check(`${ label }/literal route carries source root`, unwrapRuntimeExpr(literal.navigation?.node), unwrapRuntimeExpr(sourceRoot));
    const embedded = [];
    const rendered = renderNestedExtractionReceiver(plan, {
      embed(node) { embedded.push(node); return parser.name === 'babel' ? hostSlot(node) : node; },
    });
    checkDeep(`${ label }/only source embedded`, embedded.map(unwrapRuntimeExpr), [unwrapRuntimeExpr(sourceRoot)]);
    const native = parser.name === 'babel' ? estreeToBabel(rendered) : rendered;
    check(`${ label }/computed key`, native.computed, true);
    check(`${ label }/key value`, native.property.value, key === '0' ? 0 : 'm-q');
    check(`${ label }/native root survives conversion`, unwrapRuntimeExpr(native.object), unwrapRuntimeExpr(sourceRoot));
    if (root.includes('?.')) check(`${ label }/optional chain ends before the new key`,
      native.object.type, parser.name === 'babel' ? 'OptionalMemberExpression' : 'ChainExpression');
    check(`${ label }/read-only planning`, JSON.stringify(program.node), before);
  });
}

finish();
