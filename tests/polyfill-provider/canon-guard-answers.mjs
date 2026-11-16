// Guard variants keep their blockers and share only proved irrelevant incoming members.
import {
  guardedCanonAnswer,
  canonAnswerTable,
  cycleGuardHas,
  cycleGuardCuts,
  refuseReentry,
  withCanonQuestion,
  withReentrantQuestion,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from './harness.mjs';

const { check, finish, throwsWith } = createChecker('canon-guard-answers');
const node = {};
const kind = {};
let calls = 0;

// Splitting a context prefix must preserve every previously returned answer table.
// Context parts use Map equality, including NaN and the two spellings of zero.
for (const reverse of [false, true]) withCanonQuestion(() => {
  const first = {};
  const second = {};
  const symbol = Symbol('context');
  const contexts = [
    [], [first], [first, 1], [first, 1, 2], [first, 1, 2, 3], [first, 1, 4],
    [first, second], [second, first], [null], [undefined], [false], [''],
    [NaN], [NaN, first, NaN], [0], [0, first, -0], [symbol], [Symbol('context')],
  ];
  if (reverse) contexts.reverse();
  const tables = contexts.map((context, index) => {
    const table = canonAnswerTable(kind, context);
    table.set(first, index);
    return table;
  });
  check(`${ reverse }/distinct contexts have distinct tables`, new Set(tables).size, contexts.length);
  for (let index = contexts.length - 1; index >= 0; index--) {
    const table = canonAnswerTable(kind, [...contexts[index]]);
    check(`${ reverse }/${ index }/table survives prefix splitting`, table, tables[index]);
    check(`${ reverse }/${ index }/answer survives prefix splitting`, table.get(first), index);
  }
  check(`${ reverse }/negative zero matches zero`, canonAnswerTable(kind, [-0]), canonAnswerTable(kind, [0]));
  check(`${ reverse }/suffix negative zero matches zero`, canonAnswerTable(kind, [0, first, 0]), canonAnswerTable(kind, [-0, first, -0]));
  check(`${ reverse }/other question kind`, canonAnswerTable({}, [first]) !== canonAnswerTable(kind, [first]), true);
  const context = [first, 'copied', second];
  const table = canonAnswerTable(kind, context);
  context[1] = 'changed';
  check(`${ reverse }/caller may mutate its context array`, canonAnswerTable(kind, [first, 'copied', second]), table);
  check(`${ reverse }/changed context is separate`, canonAnswerTable(kind, context) !== table, true);
});

function ask(names, depth = 0) {
  const seen = new Set(names);
  return guardedCanonAnswer(kind, [depth], node, seen, () => {
    calls++;
    return cycleGuardHas(new Set(seen), 'blocked') ? null : depth;
  });
}

withCanonQuestion(() => {
  check('first guard', ask(['a', 'b']), 0);
  check('cold question ran', calls, 1);
  check('new irrelevant members', ask(['c', 'd']), 0);
  check('new members are verified', calls, 2);
  check('union of proved irrelevant members', ask(['a', 'c']), 0);
  check('union proof reused', calls, 2);
  check('same-size unknown blocker', ask(['a', 'blocked']), null);
  check('blocked question ran', calls, 3);
  check('blocked variant checks new members', ask(['c', 'blocked']), null);
  check('new blocked variant ran', calls, 4);
  const cuts = cycleGuardCuts();
  check('proved blocked variant', ask(['a', 'blocked']), null);
  check('proved blocked variant reused', calls, 4);
  check('reuse reports the cut', cycleGuardCuts() > cuts, true);
  check('cut did not poison proof', ask(['b', 'd']), 0);
  check('old proof survived', calls, 4);
  check('guard size remains an input', ask(['a']), 0);
  check('different size ran', calls, 5);
  check('depth remains an input', ask(['a', 'b'], 1), 1);
  check('different depth ran', calls, 6);
  withReentrantQuestion(() => {
    check('reentrant answer', ask(['a', 'b']), 0);
    check('reentrant question ran', calls, 7);
  }, 'lookup');
  check('outer answer remains', ask(['a', 'b']), 0);
  check('outer proof survived reentry', calls, 7);
});
check('new synchronous question', ask(['a', 'b']), 0);
check('new question has no prior answer', calls, 8);
throwsWith('failed question throws', () => guardedCanonAnswer(kind, [], node, new Set(), () => {
  throw new Error('sentinel');
}), 'sentinel');
check('question restored after throw', ask(['a', 'b']), 0);
check('failure did not retain state', calls, 9);

withCanonQuestion(() => {
  const blocked = {};
  function variant(names) {
    const seen = new Set(names);
    return guardedCanonAnswer(kind, [], blocked, seen, () => cycleGuardHas(new Set(seen), 'blocked') ? null : 42);
  }
  check('first blocker context', variant(['blocked', 'a']), null);
  check('second blocker context', variant(['blocked', 'b']), null);
  check('known members without blocker restore the answer', variant(['a', 'b']), 42);
});

withCanonQuestion(() => {
  let innerCalls = 0;
  let outerCalls = 0;
  const inner = {};
  const outer = {};
  function nested(names) {
    return guardedCanonAnswer(kind, ['outer'], outer, new Set(names), () => {
      outerCalls++;
      return guardedCanonAnswer(kind, ['inner'], inner, new Set(['blocked']), () => {
        innerCalls++;
        return cycleGuardHas(new Set(['blocked']), 'blocked') ? null : 'answer';
      });
    });
  }
  check('nested blocked answer', nested(['unrelated']), null);
  check('nested answer repeated', nested(['unrelated']), null);
  check('inner blocked proof reused', innerCalls, 1);
  check('foreign cut prevents outer reuse', outerCalls, 2);
  check('outer guard accounts for nested blocker', nested(['blocked']), null);
  check('accounted blocker repeated', nested(['blocked']), null);
  check('outer blocked proof reused', outerCalls, 3);
  check('omitting outer blocker cannot use its proof', nested(['unrelated']), null);
  check('outer without blocker ran again', outerCalls, 4);
});

withCanonQuestion(() => {
  let localCalls = 0;
  const local = {};
  function localCycle() {
    return guardedCanonAnswer(kind, [], local, new Set(['incoming']), () => {
      localCalls++;
      const visited = new Set(['incoming', 'local']);
      return cycleGuardHas(visited, 'local') ? null : 'answer';
    });
  }
  check('new local cycle', localCycle(), null);
  check('new local cycle repeated', localCycle(), null);
  check('local cycle does not become an incoming proof', localCalls, 2);
  check('unusable cycle proofs do not occupy the table', canonAnswerTable(kind, [1]).has(local), false);
});

withCanonQuestion(() => {
  let outerCalls = 0;
  const outer = {};
  const inner = {};
  function caughtCut() {
    return guardedCanonAnswer(kind, [], outer, new Set(['incoming']), () => {
      outerCalls++;
      throwsWith('nested failed question', () => guardedCanonAnswer(kind, [], inner, new Set(['local']), () => {
        cycleGuardHas(new Set(['local']), 'local');
        throw new Error('nested sentinel');
      }), 'nested sentinel');
      return 42;
    });
  }
  check('caught failure keeps enclosing result', caughtCut(), 42);
  check('caught failure repeated', caughtCut(), 42);
  check('throw preserves cut in enclosing question', outerCalls, 2);
});

withCanonQuestion(() => {
  let lookupCalls = 0;
  const narrowed = {};
  function lookup() {
    return guardedCanonAnswer(kind, [], narrowed, new Set(), () => {
      lookupCalls++;
      refuseReentry();
      return null;
    });
  }
  check('refused lookup result', lookup(), null);
  check('refused lookup result repeated', lookup(), null);
  check('refused lookup does not become a stable answer', lookupCalls, 2);
  check('narrowed proof is not retained', canonAnswerTable(kind, [0]).has(narrowed), false);
});
finish();
