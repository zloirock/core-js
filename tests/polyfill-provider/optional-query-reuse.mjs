// Nullable navigation reuses suffixes within one question, including alias contexts.
import { navShortCircuitSource, undefinableOptionalGuard } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { cycleGuardCuts, unwrapRuntimeExpr, withCanonQuestion, withReentrantQuestion } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { planOptionalProbe, prepareStaticReceiver } from '../../packages/core-js-polyfill-provider/detect-usage/guard-preparation.js';
import { createChecker } from './harness.mjs';

const { check, finish, runBoth } = createChecker('optional-query-reuse');

for (const shape of ['chain', 'alias']) for (const size of [4, 8, 12]) {
  const source = shape === 'chain' ? `const result = input${ '?.part'.repeat(size) }?.at;`
    : `const v0 = input; ${ Array.from({ length: size }, (_, index) => `const v${ index + 1 } = v${ index }?.part;`).join(' ') }
      const result = v${ size }?.at;`;
  runBoth(`${ shape }/${ size }`, source, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    let reads = 0;
    const members = parser.collectPaths(program, parser.name === 'babel' ? 'OptionalMemberExpression' : 'MemberExpression');
    for (const { node } of members) {
      const { object } = node;
      Object.defineProperty(node, 'object', { configurable: true, enumerable: true, get() {
        reads++;
        return object;
      } });
    }
    const sourceNode = navShortCircuitSource(path.node.init, () => null, { scope: path.scope, path, adapter });
    check(`${ label }/unknown source stays unknown`, sourceNode, null);
    check(`${ label }/counter observes the walk`, reads > size, true);
    check(`${ label }/bounded object reads`, reads < 40 * size, true);
    reads = 0;
    const prepared = prepareStaticReceiver(path.node.init, { scope: path.scope, path, adapter, resolvePure: () => null }, {
      injectImport() { throw new Error('unknown receiver cannot import'); },
    });
    check(`${ label }/unknown static receiver stays native`, prepared, path.node.init);
    check(`${ label }/declined preparation is bounded`, reads < 40 * size, true);
  });
}

function resolvePure({ name }) {
  return ['globalThis', 'self', 'Array'].includes(name) ? { entry: name, hintName: name } : null;
}

for (const [name, source, expected] of [
  ['probe', 'const result = globalThis.window?.self.Array;', ['globalThis.window', 'globalThis.window', 'globalThis.window', 'globalThis.window']],
  ['observed hop', 'const result = globalThis.self.window?.self;', [null, 'globalThis.self.window', null, 'globalThis.self.window']],
  ['stored probe', 'let held; const result = (held = globalThis.window)?.self;', [null, null, 'held = globalThis.window', 'held = globalThis.window']],
  ['held probe', 'const held = globalThis.window; const result = held?.self.Array;', ['held', 'held', 'held', 'held']],
  ['own cycle', 'let held; held = held?.self; const result = held?.Array;', [null, null, null, null]],
  ['mutual cycle', 'let a, b; a = b?.self; b = a?.self; const result = a?.Array;', [null, null, null, null]],
]) runBoth(name, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, path, adapter };
  const node = unwrapRuntimeExpr(path.node.init);
  const before = JSON.stringify(program.node);
  function spelling(value) { return value ? source.slice(value.start, value.end) : null; }
  withCanonQuestion(() => {
    let index = 0;
    for (const throughChainAssign of [false, true]) for (const observableRead of [false, true]) {
      const options = { throughChainAssign, observableRead };
      check(`${ label }/options ${ index }`, spelling(navShortCircuitSource(node, resolvePure, ctx, options)), expected[index]);
      check(`${ label }/copied context ${ index }`, spelling(navShortCircuitSource(node, resolvePure, { ...ctx }, options)), expected[index++]);
    }
    const cut = cycleGuardCuts();
    navShortCircuitSource(node, resolvePure, ctx);
    check(`${ label }/cycle answers expire`, cycleGuardCuts() > cut, name.endsWith('cycle'));
  });
  check(`${ label }/source preserved`, JSON.stringify(program.node), before);
});

runBoth('question boundaries', 'const held = globalThis.window; const result = held?.Array;', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const held = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'held').node.init;
  const node = unwrapRuntimeExpr(path.node.init);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, path, adapter, enteredValues: new Set() };
  function backed() { return { entry: 'backed' }; }
  withCanonQuestion(() => {
    check(`${ label }/nullable source`, navShortCircuitSource(node, resolvePure, ctx), node.object);
    check(`${ label }/different resolver`, navShortCircuitSource(node, backed, ctx), null);
    ctx.enteredValues.add(held);
    check(`${ label }/independent realm proof survives cycle guard`, navShortCircuitSource(node, resolvePure, ctx), node.object);
    ctx.enteredValues.clear();
    check(`${ label }/restored cycle guard`, navShortCircuitSource(node, resolvePure, ctx), node.object);
    withReentrantQuestion(() => {
      check(`${ label }/reentrant answer`, navShortCircuitSource(node, resolvePure, ctx), node.object);
    }, 'lookup');
  });
  held.property.name = 'self';
  check(`${ label }/rewrite after question`, navShortCircuitSource(node, resolvePure, ctx), null);
  held.property.name = 'window';
  check(`${ label }/rewrite restored`, navShortCircuitSource(node, resolvePure, ctx), node.object);
  const failure = new Error('resolver failure');
  let caught;
  try {
    navShortCircuitSource(node, () => { throw failure; }, ctx);
  } catch (error) {
    caught = error;
  }
  check(`${ label }/exception propagates`, caught, failure);
  check(`${ label }/question restored after exception`, navShortCircuitSource(node, resolvePure, ctx), node.object);
});

runBoth('guarded alias context', 'const held = globalThis.window?.self; const result = held?.Array;', (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const held = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'held').node.init;
  const node = unwrapRuntimeExpr(path.node.init);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { scope: path.scope, path, adapter, enteredValues: new Set() };
  withCanonQuestion(() => {
    check(`${ label }/empty guard`, navShortCircuitSource(node, resolvePure, ctx), node.object);
    ctx.enteredValues.add(held);
    check(`${ label }/held value already entered`, navShortCircuitSource(node, resolvePure, ctx), null);
    ctx.enteredValues.clear();
    check(`${ label }/empty guard restored`, navShortCircuitSource(node, resolvePure, ctx), node.object);
  });
});

for (const expression of ['globalThis?.Array.from', 'globalThis.window?.Array.from']) {
  runBoth(`completed guard/${ expression }`, `const result = ${ expression };`, (parser, program, label) => {
    const path = parser.pickPath(program, 'VariableDeclarator');
    const node = unwrapRuntimeExpr(path.node.init);
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    let queries = 0;
    const ctx = { scope: path.scope, path, adapter, resolvePure(meta) {
      queries++;
      return resolvePure(meta);
    } };
    const guard = undefinableOptionalGuard(node, ctx.resolvePure, ctx);
    queries = 0;
    const direct = planOptionalProbe(node, ctx);
    const without = queries;
    queries = 0;
    const reused = planOptionalProbe(node, ctx, { guard });
    check(`${ label }/same source`, reused?.source, direct?.source);
    check(`${ label }/counter observes resolution`, without > 0, true);
    check(`${ label }/completed verdict is reused`, queries < without, true);
  });
}

finish();
