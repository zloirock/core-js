// Enriched bindings are answers for one unchanged query, not facts that survive a rewrite.
import {
  cycleGuardHas,
  withCanonQuestion,
  withPresenceReadQuestion,
  withReentrantQuestion,
  withTraversalCaches,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createDetectionAdapter } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkTruthy, runBoth, finish } = createChecker('binding-query-cache');

runBoth('query lifetime and key', 'const value = [1]; { const value = "ab"; value.at(0); } value.includes(1);',
  (parser, program, label) => {
    const paths = parser.collectPaths(program, 'MemberExpression');
    const [inner, outer] = paths;
    const ask = { scope: outer.scope, name: 'value', path: outer, read: outer.node.object };
    let calls = 0;
    let version = 0;
    let scopeReads = 0;
    function lookup(input) {
      calls++;
      if (input.name === 'missing') return null;
      return {
        ...input, version, receiver: this,
        get declarationScope() { scopeReads++; return input.scope; },
      };
    }
    const adapter = createDetectionAdapter({}, () => ({ getBinding: lookup }));
    const twin = createDetectionAdapter({}, () => ({ getBinding: lookup }));
    const derived = Object.create(adapter);
    function once() { return adapter.getBinding(ask); }
    once();
    once();
    check(`${ label }/outside query remains live`, calls, 2);
    withCanonQuestion(() => {
      const start = calls;
      const first = once();
      for (let i = 0; i < 16; i++) check(`${ label }/same answer ${ i }`, once() === first, true);
      check(`${ label }/one lookup for repeated asks`, calls - start, 1);
      check(`${ label }/no eager metadata getter`, scopeReads, 0);
      check(`${ label }/lazy metadata stays available`, first.declarationScope === ask.scope, true);
      for (const [key, value] of [['scope', inner.scope], ['path', inner], ['read', inner.node.object], ['name', 'other']]) {
        const changed = adapter.getBinding({ ...ask, [key]: value });
        check(`${ label }/separate ${ key }`, changed[key] === value, true);
        check(`${ label }/original ${ key } remains separate`, once()[key] === ask[key], true);
      }
      check(`${ label }/adapter identity`, twin.getBinding(ask).receiver === twin, true);
      check(`${ label }/derived adapter identity`, derived.getBinding(ask).receiver === derived, true);
      const missing = { ...ask, name: 'missing' };
      const beforeMissing = calls;
      check(`${ label }/missing answer`, adapter.getBinding(missing), null);
      check(`${ label }/missing answer again`, adapter.getBinding(missing), null);
      check(`${ label }/one missing lookup`, calls - beforeMissing, 1);
      for (const [kind, enter] of [
        ['presence', question => withPresenceReadQuestion(question)],
        ['lookup', question => withReentrantQuestion(question, 'lookup')],
        ['rewriting traversal', question => withTraversalCaches(false, question)],
      ]) {
        const before = calls;
        enter(() => {
          once();
          once();
        });
        check(`${ label }/${ kind } bypasses the answer`, calls - before, 2);
        check(`${ label }/${ kind } restores the outer query`, once() === first, true);
      }
    });
    version++;
    withCanonQuestion(() => check(`${ label }/fresh metadata after a rewrite`, once().version, version));
    const beforeWalk = calls;
    withTraversalCaches(true, () => {
      once();
      withCanonQuestion(once);
      once();
    });
    check(`${ label }/one lookup in a read-only traversal`, calls - beforeWalk, 1);
  });

// An interrupted or cycle-cut lookup cannot seed the following complete answer.
let fails = true;
let cuts = true;
let calls = 0;
const error = new Error('lookup failed');
const ask = { scope: {}, name: 'value', path: null };
const adapter = createDetectionAdapter({}, () => ({
  getBinding() {
    calls++;
    if (fails) throw error;
    if (cuts) cycleGuardHas(new Set(['value']), 'value');
    return { complete: !cuts };
  },
}));
withCanonQuestion(() => {
  let caught;
  try {
    adapter.getBinding(ask);
  } catch (error_) {
    caught = error_;
  }
  check('throw propagates unchanged', caught, error);
  fails = false;
  check('cycle-cut answer', adapter.getBinding(ask).complete, false);
  cuts = false;
  check('complete answer after the cut', adapter.getBinding(ask).complete, true);
  check('complete answer is reused', adapter.getBinding(ask).complete, true);
  check('throw and cut were not cached', calls, 3);
});

// Composition preserves host descriptors and does not force a lazy method or package view.
let methodReads = 0;
let packages = null;
const lazyHost = createDetectionAdapter({ getPackages: () => packages }, () => ({
  get getBinding() { methodReads++; return () => null; },
}));
check('no eager method getter', methodReads, 0);
check('lazy method remains callable', lazyHost.getBinding(ask), null);
check('method getter preserved', methodReads, 1);
packages = ['custom'];
check('package getter remains live', lazyHost.packages === packages, true);
check('optional binding method remains absent', createDetectionAdapter({}, () => ({})).getBinding, undefined);

// Real host views keep source bindings, shadows and lazy hoist recovery separate.
for (const source of [
  'const value = [1]; { const value = "ab"; value.at(0); } value.includes(1);',
  'function read() { { var value = [1]; } return value.at(0); }',
  'let value = [1]; value = "ab"; value.at(0);',
]) runBoth(`host bindings/${ source }`, source, (parser, program, label) => {
  const host = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  for (const path of parser.collectPaths(program, 'MemberExpression')) {
    const input = { scope: path.scope, name: 'value', path, read: path.node.object };
    const fresh = host.getBinding(input);
    checkTruthy(`${ label }/binding exists`, fresh?.node);
    withCanonQuestion(() => {
      const first = host.getBinding(input);
      check(`${ label }/repeated enriched view`, host.getBinding(input) === first, true);
      check(`${ label }/declaration preserved`, first.node === fresh.node, true);
      check(`${ label }/declaration scope preserved`, first.scope === fresh.scope, true);
      check(`${ label }/writes preserved`, first.constantViolations.length, fresh.constantViolations.length);
    });
  }
});

runBoth('minted alias between questions', 'held.from([]);', (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression');
  let info = null;
  const host = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', getInjector: () => ({ getBindingInfo: () => info }),
  });
  const input = { scope: path.scope, name: 'held', path };
  withCanonQuestion(() => check(`${ label }/initially absent`, host.getBinding(input), null));
  info = { source: '@core-js/pure/full/array', hint: 'Array' };
  withCanonQuestion(() => check(`${ label }/new registry hint is live`, host.getBinding(input)?.polyfillHint, 'Array'));
});

finish();
