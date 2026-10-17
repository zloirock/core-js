import iteratorKey from '@core-js/pure/actual/symbol/iterator';
import getIteratorMethod from '@core-js/pure/actual/get-iterator-method';
import { restoreProperty } from '../helpers/restore-property.cjs';
import { _unused as exportedAt, _unused2 as exportedFrom, _unused3 as exportedIncludes } from './destructuring-capture-reuse.js';

QUnit.test('destructuring: exported sentinel-shaped leaves remain externally readable', assert => {
  assert.same(typeof exportedAt, 'function', 'the instance leaf remains served');
  assert.same(exportedAt.call([1, 2], -1), 2, 'the instance value keeps its receiver');
  assert.same(typeof exportedFrom, 'function', 'the static leaf remains served');
  assert.deepEqual(exportedFrom([1, 2]), [1, 2], 'the static value remains callable');
  assert.same(typeof exportedIncludes, 'function', 'a called dispatcher does not hide the exported leaf');
  assert.same(exportedIncludes.call([1, 2], 2), true, 'the second instance value keeps its receiver');
});

QUnit.test('destructuring assignment: a sole nested instance claim reads its constructor getter once', assert => {
  let reads = 0;
  // eslint-disable-next-line unicorn/no-static-only-class -- the class getter is the source receiver
  class Source {
    static get A() {
      reads++;
      return Array;
    }
  }
  let method;
  // eslint-disable-next-line prefer-const -- assignment is the host under test
  ({ prototype: { at: method } } = Source.A);
  assert.same(reads, 1, 'the dispatch performs the sole source read');
  assert.same(method.call([1, 2], -1), 2, 'the nested instance method works without its native');

  const quiet = { A: Array };
  let quietMethod;
  // eslint-disable-next-line prefer-const -- the quiet assignment is the control
  ({ prototype: { at: quietMethod } } = quiet.A);
  assert.same(quietMethod.call([3, 4], -1), 4, 'the quiet receiver keeps the same dispatch');
});

QUnit.test('destructuring assignment: getter reads stay inside bodyless and discarded sequence hosts', assert => {
  const events = [];
  // eslint-disable-next-line unicorn/no-static-only-class -- the class getter is the source receiver
  class Source {
    static get A() {
      events.push('read');
      return Array;
    }
  }
  let method;
  if (events.length) ({ prototype: { at: method } } = Source.A);
  assert.same(events.length, 0, 'a skipped bodyless assignment performs no read');
  if (!events.length) ({ prototype: { at: method } } = Source.A);
  assert.deepEqual(events, ['read'], 'the taken bodyless assignment reads once');
  assert.same(method.call([1, 2], -1), 2);
  // eslint-disable-next-line @stylistic/no-extra-parens -- the discarded sequence host is the syntax under test
  (events.push('before'), ({ prototype: { at: method } } = Source.A), events.push('after'));
  assert.deepEqual(events, ['read', 'before', 'read', 'after'], 'the sequence keeps the source slot');
  assert.same(method.call([3, 4], -1), 4);
});

QUnit.test('destructuring declaration: the sole getter receiver is the assignment control', assert => {
  let reads = 0;
  const source = {
    get A() {
      reads++;
      return Array;
    },
  };
  const { prototype: { at: method } } = source.A;
  assert.same(reads, 1, 'the declaration also performs one getter read');
  assert.same(method.call([5, 6], -1), 6);
});

QUnit.test('destructuring assignment: a receiver capture keeps every sibling instance claim', assert => {
  const events = [];
  function selected() { return 'selected'; }
  const later = { flat() { return 'later'; } };
  let receiver = {
    get flat() {
      events.push('method');
      receiver = later;
      return selected;
    },
  };
  const known = [1, [2]];
  let method, flat;
  // eslint-disable-next-line prefer-const -- both assignment targets are the host under test
  ({ y: { flat: method }, z: { flat } } = { y: receiver, z: known });
  assert.same(method, selected, 'the getter selects the original method');
  assert.deepEqual(flat.call(known), [1, 2], 'the later sibling also receives its polyfill');
  assert.deepEqual(events, ['method'], 'the source method getter runs once');
});

QUnit.test('destructuring declaration: a sole literal slot supplies its nested array method', assert => {
  const slotted = { Model: { prototype: [1, [2]] } };
  const { slot: { Model: { prototype: { flat } } } } = { slot: slotted };
  assert.deepEqual(flat.call(slotted.Model.prototype), [1, 2]);
});

QUnit.test('destructuring declaration: a selected static keeps its source getter read', assert => {
  const events = [];
  const declared = (flag => {
    const shelf = {
      get M() {
        events.push('declared');
        return Map;
      },
    };
    const { groupBy } = flag ? shelf.M : Object;
    return groupBy([3, 4], value => value % 2).size;
  })(true);
  const defaulted = (flag => {
    const shelf = {
      get M() {
        events.push('defaulted');
        return Map;
      },
    };
    const { groupBy = null } = flag ? shelf.M : Object;
    return groupBy([3, 4], value => value % 2).size;
  })(true);
  const unselected = (flag => {
    const shelf = {
      get M() {
        events.push('unselected');
        return Map;
      },
    };
    const { groupBy } = flag ? shelf.M : Object;
    return groupBy([3, 4], value => value % 2).size;
  })(false);
  const assigned = (flag => {
    const shelf = {
      get M() {
        events.push('assigned');
        return Map;
      },
    };
    let groupBy;
    // eslint-disable-next-line prefer-const -- assignment is the native control for the declaration sink
    ({ groupBy } = flag ? shelf.M : Object);
    return groupBy([3, 4], value => value % 2).size;
  })(true);
  assert.same(declared, 2, 'the declaration serves its static');
  assert.same(defaulted, 2, 'the original leaf default keeps the served static');
  assert.same(unselected, undefined, 'the other constructor keeps its own result');
  assert.same(assigned, 2, 'the assignment control serves the same static');
  assert.deepEqual(events, ['declared', 'defaulted', 'assigned'], 'only selected getter reads run, once each');
});

// This is prior output: the native sentinel and explicit helper each read once.
export function readPriorIteratorSentinel(extra) {
  // eslint-disable-next-line no-unused-vars -- the prior-output sentinel deliberately remains unread
  const { w: { [iteratorKey]: _unused } } = { ...extra, w: globalThis };
  return getIteratorMethod(globalThis);
}

export function readPriorIteratorEffect(extra) {
  // eslint-disable-next-line no-unused-vars -- the prior-output sentinel deliberately remains unread
  const { w: { [iteratorKey]: _unused2 } } = { ...extra, w: globalThis };
  getIteratorMethod(globalThis);
}

export function readPriorIteratorVoid(extra) {
  // eslint-disable-next-line no-unused-vars -- the prior-output sentinel deliberately remains unread
  const { w: { [iteratorKey]: _unused3 } } = { ...extra, w: globalThis };
  // eslint-disable-next-line no-void -- the unary expression is the host under test
  void getIteratorMethod(globalThis);
}

export function * readPriorIteratorYield(extra) {
  // eslint-disable-next-line no-unused-vars -- the prior-output sentinel deliberately remains unread
  const { w: { [iteratorKey]: _unused4 } } = { ...extra, w: globalThis };
  yield getIteratorMethod(globalThis);
}

// eslint-disable-next-line es/no-async-functions -- exercise the helper read across lowering
export async function readPriorIteratorAwait(extra) {
  // eslint-disable-next-line no-unused-vars -- the prior-output sentinel deliberately remains unread
  const { w: { [iteratorKey]: _unused5 } } = { ...extra, w: globalThis };
  return await getIteratorMethod(globalThis);
}

QUnit.test('destructuring: a prior iterator sentinel keeps exactly its two source reads', assert => {
  const realm = Function('return this')();
  const previous = Object.getOwnPropertyDescriptor(realm, iteratorKey);
  const events = [];
  let reads = 0;
  function method() { /* empty */ }
  restoreProperty(realm, iteratorKey, {
    configurable: true,
    get() {
      events.push('iterator');
      if (++reads === 3) throw new Error('third iterator read');
      return method;
    },
  });
  try {
    const extra = {
      get value() {
        events.push('spread');
        return 1;
      },
    };
    assert.same(readPriorIteratorSentinel(extra), method, 'the original method is returned');
    assert.same(reads, 2, 'one native sentinel read and one explicit helper read');
    assert.deepEqual(events, ['spread', 'iterator', 'iterator'], 'the spread stays before both reads');
  } finally {
    restoreProperty(realm, iteratorKey, previous);
  }
});

// eslint-disable-next-line es/no-async-functions -- exercise both synchronous and suspended hosts
QUnit.test('destructuring: prior iterator extraction survives expression and suspension hosts', async assert => {
  const realm = Function('return this')();
  const previous = Object.getOwnPropertyDescriptor(realm, iteratorKey);
  for (const [name, run, returnsMethod] of [
    ['expression', readPriorIteratorEffect, false],
    ['void', readPriorIteratorVoid, false],
    ['yield', extra => readPriorIteratorYield(extra).next().value, true],
    ['await', readPriorIteratorAwait, true],
  ]) {
    const events = [];
    let reads = 0;
    function method() { /* empty */ }
    restoreProperty(realm, iteratorKey, {
      configurable: true,
      get() {
        events.push('iterator');
        if (++reads === 3) throw new Error('third iterator read');
        return method;
      },
    });
    try {
      const extra = {
        get value() {
          events.push('spread');
          return 1;
        },
      };
      let result, failure;
      try {
        result = await run(extra);
      } catch (error) {
        failure = error;
      }
      assert.same(failure, undefined, `${ name }: no third read`);
      assert.same(result === method, returnsMethod, `${ name }: the source result is preserved`);
      assert.same(reads, 2, `${ name }: exactly the two source reads`);
      assert.deepEqual(events, ['spread', 'iterator', 'iterator'], `${ name }: the spread stays before both reads`);
    } finally {
      restoreProperty(realm, iteratorKey, previous);
    }
  }
});

// The open call keeps the condition live while both arms select the same constructor.
export function readMirroredAssignment(pick) {
  let from, at;
  // eslint-disable-next-line prefer-const -- assignment targets are the source host under test
  ({ from, prototype: { at } } = pick() ? Array : Array);
  return [from([3])[0], at.call([4], 0)];
}

let queuedAssignmentSource;
export function setQueuedAssignmentSource(value) { queuedAssignmentSource = value; }
setQueuedAssignmentSource({ keys: undefined, data: [1] });
let queuedKeys, queuedAt;
// eslint-disable-next-line prefer-const -- the earlier flat claim precedes a nested receiver capture
({ keys: queuedKeys, data: { at: queuedAt } } = queuedAssignmentSource);

QUnit.test('destructuring assignment: a mirror retains its earlier served assignment target', assert => {
  assert.deepEqual(readMirroredAssignment(() => true), [3, 4]);
  assert.deepEqual(readMirroredAssignment(() => false), [3, 4]);
});

QUnit.test('destructuring assignment: a later nested capture keeps the earlier queued slot', assert => {
  assert.same(queuedKeys, undefined, 'the own undefined slot stays undefined');
  assert.same(queuedAt.call([4], 0), 4, 'the later nested slot keeps its instance polyfill');
});

QUnit.test('destructuring assignment: queued and nested reads share the original receiver', assert => {
  const events = [];
  function selected() { return 4; }
  const original = {
    get keys() {
      events.push('keys');
      setQueuedAssignmentSource({ data: 'wrong' });
      return undefined;
    },
    get data() {
      events.push('data');
      return {
        get at() {
          events.push('at');
          return selected;
        },
      };
    },
  };
  setQueuedAssignmentSource(original);
  let keys, at;
  // eslint-disable-next-line prefer-const -- both targets are written by the queued source host
  ({ keys, data: { at } } = queuedAssignmentSource);
  assert.same(keys, undefined, 'the first own undefined slot stays undefined');
  assert.same(at, selected, 'the later read uses the receiver captured before its binding changed');
  assert.same(at(), 4, 'the own method keeps its behavior');
  assert.deepEqual(events, ['keys', 'data', 'at'], 'each getter runs once in source order');
});

QUnit.test('destructuring assignment: quiet inner hops keep quoted and numeric source keys', assert => {
  const quoted = { wrapper: { data: [1] }, tail: 7 };
  let at, quotedTail;
  // eslint-disable-next-line prefer-const, @stylistic/quote-props -- the source key spelling is the regression
  ({ 'wrapper': { 'data': { at } }, tail: quotedTail } = quoted);
  const numeric = [[[1]], 8];
  let includes, numericTail;
  // eslint-disable-next-line prefer-const -- numeric member spelling belongs to the assignment renderer
  ({ 0: { 0: { includes } }, 1: numericTail } = numeric);
  assert.same(at.call([4], 0), 4, 'the quoted array receiver keeps its family');
  assert.same(includes.call([4], '4'), false, 'the numeric array receiver keeps its family');
  assert.deepEqual([quotedTail, numericTail], [7, 8], 'the native sibling slots stay after the reads');
});

QUnit.test('destructuring assignment: a sole outer hop preserves a deeper sibling read window', assert => {
  const events = [];
  function selected() { return 4; }
  setQueuedAssignmentSource({
    get keys() {
      events.push('keys');
      return undefined;
    },
    get wrapper() {
      events.push('wrapper');
      return {
        get row() {
          events.push('row');
          return {
            get before() {
              events.push('before');
              setQueuedAssignmentSource({ wrapper: { row: { data: 'wrong' } } });
              return 7;
            },
            get data() {
              events.push('data');
              return { at: selected };
            },
          };
        },
      };
    },
  });
  let keys, before, at;
  // eslint-disable-next-line prefer-const -- a deeper shared receiver survives the earlier native getter
  ({ keys, wrapper: { row: { before, data: { at } } } } = queuedAssignmentSource);
  assert.same(keys, undefined, 'the first native slot stays undefined');
  assert.same(before, 7, 'the deeper native slot keeps its value');
  assert.same(at, selected, 'the later method reads the same deeper receiver after rebinding');
  assert.deepEqual(events, ['keys', 'wrapper', 'row', 'before', 'data'], 'all source getters run once, in order');
});
