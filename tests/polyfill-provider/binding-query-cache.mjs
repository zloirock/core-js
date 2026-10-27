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
for (const name of ['hasBinding', 'getBinding']) {
  let methodReads = 0;
  let packages = null;
  const empty = name === 'hasBinding' ? false : null;
  const lazyHost = createDetectionAdapter({ getPackages: () => packages }, () => ({
    get [name]() { methodReads++; return () => empty; },
  }));
  check(`${ name }/no eager method getter`, methodReads, 0);
  check(`${ name }/lazy method remains callable`, lazyHost[name](ask), empty);
  check(`${ name }/method getter preserved`, methodReads, 1);
  packages = ['custom'];
  check(`${ name }/package getter remains live`, lazyHost.packages === packages, true);
  check(`${ name }/optional method remains absent`, createDetectionAdapter({}, () => ({}))[name], undefined);
}

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
      check(`${ label }/presence stays boolean`, host.hasBinding(input), true);
      const first = host.getBinding(input);
      check(`${ label }/repeated enriched view`, host.getBinding(input) === first, true);
      check(`${ label }/declaration preserved`, first.node === fresh.node, true);
      check(`${ label }/declaration scope preserved`, first.scope === fresh.scope, true);
      check(`${ label }/writes preserved`, first.constantViolations.length, fresh.constantViolations.length);
      check(`${ label }/metadata cannot replace presence`, host.hasBinding(input), true);
      const missing = { ...input, name: 'absent' };
      check(`${ label }/missing presence stays boolean`, host.hasBinding(missing), false);
      check(`${ label }/missing metadata stays null`, host.getBinding(missing), null);
    });
  }
});

runBoth('minted alias between questions', 'held.from([]);', (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression');
  let info = null;
  const host = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', getInjector: () => ({ getBindingInfo: () => info, hasAliasName: () => !!info }),
  });
  const input = { scope: path.scope, name: 'held', path };
  withCanonQuestion(() => check(`${ label }/initially absent`, host.getBinding(input), null));
  withCanonQuestion(() => check(`${ label }/initially not present`, host.hasBinding(input), false));
  info = { source: '@core-js/pure/full/array', hint: 'Array' };
  withCanonQuestion(() => check(`${ label }/new registry hint is live`, host.getBinding(input)?.polyfillHint, 'Array'));
  withCanonQuestion(() => check(`${ label }/new registry presence is live`, host.hasBinding(input), true));
});

// Presence is a separate host question: a runtime or minted binding can exist without metadata.
runBoth('presence query lifetime and key', 'const value = [1]; { const value = "ab"; value.at(0); } value.includes(1);',
  (parser, program, label) => {
    const [inner, outer] = parser.collectPaths(program, 'MemberExpression');
    const input = { scope: outer.scope, name: 'value', path: outer, read: outer.node.object };
    let reads = 0;
    let available = true;
    let receiver;
    function lookup(query) {
      reads++;
      receiver = this;
      return available && query.name === 'value';
    }
    const presenceAdapter = createDetectionAdapter({}, () => ({
      hasBinding: lookup,
      getBinding() { throw new Error('Presence must not force binding metadata'); },
    }));
    const twin = createDetectionAdapter({}, () => ({ hasBinding: lookup }));
    const derived = Object.create(presenceAdapter);
    withCanonQuestion(() => {
      for (const name of ['value', 'missing']) {
        const before = reads;
        for (let i = 0; i < 8; i++) check(`${ label }/${ name } ${ i }`, presenceAdapter.hasBinding({ ...input, name }), name === 'value');
        check(`${ label }/one presence proof for ${ name }`, reads - before, 1);
      }
      for (const [key, value] of [['scope', inner.scope], ['path', inner], ['read', inner.node.object]]) {
        const before = reads;
        const changed = { ...input, [key]: value };
        presenceAdapter.hasBinding(changed);
        presenceAdapter.hasBinding(changed);
        check(`${ label }/separate ${ key }`, reads - before, 1);
      }
      const before = reads;
      twin.hasBinding(input);
      check(`${ label }/other adapter is read`, receiver === twin, true);
      derived.hasBinding(input);
      check(`${ label }/derived adapter is read`, receiver === derived, true);
      check(`${ label }/adapter identity separates answers`, reads - before, 2);
      for (const [kind, enter] of [
        ['presence', question => withPresenceReadQuestion(question)],
        ['lookup', question => withReentrantQuestion(question, 'lookup')],
        ['rewriting traversal', question => withTraversalCaches(false, question)],
      ]) {
        available = false;
        enter(() => check(`${ label }/${ kind } stays live`, presenceAdapter.hasBinding(input), false));
        available = true;
      }
    });
    available = false;
    withCanonQuestion(() => check(`${ label }/next question sees removal`, presenceAdapter.hasBinding(input), false));
    available = true;
    check(`${ label }/outside question sees insertion`, presenceAdapter.hasBinding(input), true);
    available = false;
    check(`${ label }/outside question sees removal`, presenceAdapter.hasBinding(input), false);
  });

// A failed or incomplete presence proof must be retried, just like enriched metadata.
let presenceReads = 0;
const presenceError = new Error('presence failed');
const presence = createDetectionAdapter({}, () => ({ hasBinding() {
  presenceReads++;
  if (presenceReads === 1) throw presenceError;
  if (presenceReads === 2) {
    cycleGuardHas(new Set(['value']), 'value');
    return false;
  }
  return true;
} }));
withCanonQuestion(() => {
  let caught;
  try {
    presence.hasBinding(ask);
  } catch (error_) {
    caught = error_;
  }
  check('presence throw propagates', caught, presenceError);
  check('presence cycle-cut refusal', presence.hasBinding(ask), false);
  check('presence retry completes', presence.hasBinding(ask), true);
  check('complete presence proof is reused', presence.hasBinding(ask), true);
  check('only complete presence proof cached', presenceReads, 3);
});

finish();
