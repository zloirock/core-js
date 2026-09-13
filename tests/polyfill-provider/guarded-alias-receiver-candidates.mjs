// Guard candidates follow captured alias sources in their declaration scopes, even when
// conditional placement prevents a direct receiver proof. Candidate recursion must terminate.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { handleMemberExpressionNode } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { aliasWriteCtorNames } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { reachableAliasValues, resolveObjectName } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { adapters, createChecker } from './harness.mjs';

const { check, checkDeep, finish } = createChecker('guarded-alias-receiver-candidates');

const rows = [
  ['guarded source', 'try { var realm = globalThis; } finally {} const held = realm; observe(held);', ['globalThis']],
  ['transitive source', 'if (flag) { var realm = globalThis; } const middle = realm; const held = middle; observe(held);', ['globalThis']],
  ['assigned alias', 'if (flag) { var realm = globalThis; } let held; if (other) held = realm; observe(held);', ['globalThis']],
  ['declaration scope', 'if (flag) { var realm = globalThis; } const held = realm; function inspect(realm) { observe(held); }', ['globalThis']],
  ['shadowed source', 'if (flag) { var realm = globalThis; } function inspect(realm) { const held = realm; observe(held); }', []],
  ['conditional constructor', 'if (flag) { var source = Map; } const held = source; observe(held);', ['Map']],
  ['alias cycle', 'var realm = held; var held = realm; observe(held);', []],
  ['destructure is not its container', 'const { realm: held } = globalThis; observe(held);', []],
  ['overwritten initializer', 'let held = globalThis; held = source; observe(held);', []],
  ['opaque pattern overwrite', 'let held = globalThis; [held] = source; observe(held);', []],
  ['object pattern overwrite', 'let held = globalThis; ({ value: held } = source); observe(held);', []],
  ['conditional overwrite', 'let held = globalThis; if (flag) [held] = source; observe(held);', ['globalThis']],
  ['failed overwrite', 'let held = globalThis; try { [held] = source; } catch {} observe(held);', ['globalThis']],
  ['captured before overwrite', 'let realm = globalThis; const held = realm; [realm] = source; observe(held);', ['globalThis']],
  ['captured after overwrite', 'let realm = globalThis; [realm] = source; const held = realm; observe(held);', []],
  ['overwritten transitive alias', 'const realm = globalThis; let held = realm; [held] = source; observe(held);', []],
  ['loop retains initial candidate', 'let held = globalThis; for (let i = 0; i < 2; i++) { observe(held); [held] = source; }', ['globalThis']],
  ['closure retains initial candidate', 'let held = globalThis; const read = () => observe(held); read(); [held] = source; read();', ['globalThis']],
  ['new constructor write', 'let held = globalThis; held = Map; observe(held);', ['Map']],
  ['pattern default candidate', 'let held = globalThis; [held = Map] = source; observe(held);', ['Map']],
  ['registered init overwritten', 'let held = globalThis; [held] = source; observe(held);', [], 'init'],
  ['registered conditional overwrite', 'let held = globalThis; if (flag) [held] = source; observe(held);', ['globalThis'], 'init'],
  ['registered later write', 'let held; [held] = source; if (flag) held = globalThis; observe(held);', ['globalThis'], 'write'],
  ['registered conditional later write', 'let held = globalThis; [held] = source; if (flag) held = globalThis; observe(held);', ['globalThis'], 'write'],
  ['opposite initializer', 'function f(flag) { if (flag) { var held = globalThis; } else observe(held); }', []],
  ['opposite later initializer', 'function f(flag) { if (flag) observe(held); else { var held = globalThis; } }', []],
  ['opposite nested initializer', 'function f(flag, other) { if (flag) { var held = globalThis; } else if (other) observe(held); }', []],
  ['opposite constructor initializer', 'function f(flag) { if (flag) { var held = Map; } else observe(held); }', []],
  ['opposite assignment', 'function f(flag) { let held; if (flag) held = globalThis; else observe(held); }', []],
  ['opposite expression assignment', 'function f(flag) { let held; return flag ? held = globalThis : observe(held); }', []],
  ['opposite captured initializer', 'function f(flag) { if (flag) { var realm = globalThis; } else { const held = realm; observe(held); } }', []],
  ['opposite registered initializer', 'function f(flag) { if (flag) { var held = globalThis; } else observe(held); }', [], 'init'],
  ['opposite registered assignment', 'function f(flag) { let held; if (flag) held = globalThis; else observe(held); }', [], 'write'],
  ['later initializer', 'function f() { observe(held); var held = globalThis; }', []],
  ['many later writes', `let held = Map; observe(held); ${ 'held = globalThis;'.repeat(32) }`, ['Map']],
  ['later write in loop', 'let held; for (let i = 0; i < 2; i++) { observe(held); held = globalThis; }', ['globalThis']],
  ['later write before deferred read', 'let held; const read = () => observe(held); held = globalThis; read();', ['globalThis']],
  ['same-arm initializer', 'function f(flag) { if (flag) { var held = globalThis; observe(held); } }', ['globalThis']],
  ['loop-carried initializer', 'for (let i = 0; i < 2; i++) { if (!i) { var held = globalThis; } else observe(held); }', ['globalThis']],
  ['loop-carried assignment', 'let held; for (let i = 0; i < 2; i++) { if (!i) held = globalThis; else observe(held); }', ['globalThis']],
  ['fresh loop-body binding', 'for (let i = 0; i < 2; i++) { let held; if (!i) held = globalThis; else observe(held); }', []],
  ['reentered function', 'let held; function f(flag) { if (flag) held = globalThis; else observe(held); } f(true); f(false);', ['globalThis']],
  ['deferred opposite reader', 'let held; function f(flag) { if (flag) held = globalThis; else return () => observe(held); }', ['globalThis']],
  ['deferred opposite writer', 'let held; if (flag) { function write() { held = globalThis; } } else observe(held);', ['globalThis']],
  ['fall-through switch', 'let held; switch (flag) { case 0: held = globalThis; case 1: observe(held); }', ['globalThis']],
  ['earlier captured value', 'let realm = globalThis; const held = realm; if (flag) realm = source; else observe(held);', ['globalThis']],
];
let checked = 0;
for (const parser of adapters) for (const method of ['usage-global', 'usage-pure']) {
  for (const [name, source, expected, registration] of rows) {
    const program = parser.parseAndScope(source);
    const [usage] = parser.pickPath(program, 'CallExpression', path => path.node.callee.name === 'observe').get('arguments');
    const adapter = parser.name === 'babel' ? createBabelAdapter({ method }) : createEstreeAdapter({ method });
    if (registration) {
      const { getBinding } = adapter;
      const origin = registration === 'init'
        ? parser.pickPath(program, 'VariableDeclarator', p => p.node.id.name === 'held')
        : parser.pickPath(program, 'AssignmentExpression', p => p.node.right.name === 'globalThis');
      adapter.getBinding = (scope, boundName, path) => {
        const binding = getBinding(scope, boundName, path);
        return binding && boundName === 'held' ? {
          ...binding, guardedAliasHint: 'globalThis', guardedAliasHints: ['globalThis'], guardedAliasWrite: origin.node,
        } : binding;
      };
    }
    checkDeep(`${ parser.name }: ${ method }: ${ name }`,
      aliasWriteCtorNames({ name: 'held', scope: usage.scope, adapter, path: usage }), expected);
    if (name.startsWith('opposite')) {
      check(`${ parser.name }: ${ method }: ${ name }: no definite receiver`, resolveObjectName({
        objectNode: usage.node, scope: usage.scope, adapter, path: usage,
      }), null);
      checked++;
    }
    if (name === 'guarded source') {
      checkDeep(`${ parser.name }: ${ method }: ordinary union retains its declared-value contract`, reachableAliasValues({
        aliasNode: usage.node, scope: usage.scope, adapter, path: usage,
        resolve: hop => resolveObjectName({ objectNode: hop.node, ...hop.ctx, usageNode: hop.readNode }),
      }), []);
      checked++;
    }
    checked++;
  }
}
check('all rows were checked', checked, 224);
for (const parser of adapters) for (const [name, source, key, expected] of [
  ['conditional native constructor', 'if (flag) { var held = globalThis; } held.Array.of(7);', 'of', 'Array'],
  ['conditional native namespace', 'if (flag) { var held = globalThis; } held.Object.keys(value);', 'keys', 'Object'],
  ['opposite arm', 'function f(flag) { if (flag) { var held = globalThis; } else held.Array.of(7); }', 'of', null],
  ['before initializer', 'function f() { held.Array.of(7); var held = globalThis; }', 'of', null],
  ['unbacked realm hop', "if (flag) { var held = globalThis; } held[(effect(), 'window')].self;", 'self', null],
  ['unknown root', 'function f(held) { held.Array.of(7); }', 'of', null],
]) {
  const program = parser.parseAndScope(source);
  const usage = parser.pickPath(program, 'MemberExpression', path => path.node.property?.name === key);
  const adapter = parser.name === 'babel' ? createBabelAdapter({ method: 'usage-pure' }) : createEstreeAdapter({ method: 'usage-pure' });
  const meta = handleMemberExpressionNode({
    node: usage.node, path: usage, scope: usage.scope, adapter,
    handledObjects: new WeakSet(), suppressProxyGlobals: new WeakSet(),
  });
  check(`${ parser.name }: ${ name }: captured candidate`, meta?.captureGuardReceiver ? meta.guardedAliasHint : null, expected);
}
finish();
