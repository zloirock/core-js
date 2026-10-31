// Source lifetime, not parser dialect, determines which nested receiver can be saved.
import { planAssignmentOverwrite } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { identifier, renderNestedExtractionReceiver } from '../../packages/core-js-polyfill-provider/render.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
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

// A surviving reader needs the captured slot; a rest sibling prevents that capture.
for (const [name, pattern, init, inline] of [
  ['inner sibling', '{ y: { at: method, length: kept } }', '{ y: holder.rows }', false],
  ['outer sibling', '{ y: { at: method }, kept }', '{ y: holder.rows, kept: 1 }', true],
  ['rest refuses capture', '{ y: { at: method, ...rest } }', '{ y: holder.rows }', null],
]) runBoth(name, `let method, kept, rest; (${ pattern } = ${ init });`, (parser, program, label) => {
  const path = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
    item => item.node.value?.name === 'method');
  const assignment = parser.pickPath(program, 'AssignmentExpression').node;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, path, adapter, resolveGlobalPolyfill, resolveStaticPolyfill, isOwnAlias: () => false };
  const input = {
    path, assignment, entry: 'instance/at', pending: true,
    chain: [{ outerPattern: assignment.left, hopProp: assignment.left.properties[0] }],
  };
  const before = JSON.stringify(program.node);
  const plan = planAssignmentOverwrite(input, ctx);
  check(`${ label }/capture`, plan?.kind ?? null, inline === null ? null : 'capture');
  check(`${ label }/inline leaf`, plan?.capture?.inlineLeaf ?? null, inline);
  const repeated = planAssignmentOverwrite(input, ctx);
  check(`${ label }/repeat capture`, repeated?.kind, plan?.kind);
  check(`${ label }/repeat source slot`, repeated?.capture?.leafPattern, plan?.capture?.leafPattern);
  check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
});

finish();
