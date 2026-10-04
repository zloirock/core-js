/* eslint-disable @stylistic/no-extra-parens -- nested computed receiver and key sequence hosts */

import { withTemporaryProperty } from '../helpers/restore-property.cjs';

QUnit.test('computed symbol key captures a reassigned receiver', assert => {
  let arr = ['held'];
  const iterator = arr[(arr = ['swapped'], Symbol.iterator)]();
  assert.same(iterator.next().value, 'held');
  assert.same(arr[0], 'swapped');
});

QUnit.test('computed symbol key captures after nested receiver prefixes', assert => {
  let arr;
  const log = [];
  const iterator = (log.push('first'), (log.push('second'), arr = ['held'], arr))[
    Symbol[(log.push('key'), arr = ['swapped'], 'iterator')]
  ]();
  assert.same(iterator.next().value, 'held');
  assert.deepEqual(log, ['first', 'second', 'key']);
  assert.same(arr[0], 'swapped');
});

QUnit.test('computed symbol key evaluates a getter receiver once before its key', assert => {
  const log = [];
  const box = {
    get list() {
      log.push('receiver');
      return ['held'];
    },
  };
  const iterator = box.list[(log.push('key'), Symbol.iterator)]();
  assert.same(iterator.next().value, 'held');
  assert.deepEqual(log, ['receiver', 'key']);
});

QUnit.test('computed symbol key constructs its literal receiver before element writes', assert => {
  let value = 'held';
  const iterator = [value][(value = 'swapped', Symbol.iterator)]();
  assert.same(iterator.next().value, 'held');
  assert.same(value, 'swapped');
});

QUnit.test('computed symbol member read selects the original iterator method', assert => {
  let arr = ['held'];
  const method = arr[(arr = { [Symbol.iterator]() { return 'swapped'; } }, Symbol.iterator)];
  assert.same(method.call(['check']).next().value, 'check');
  assert.same(arr[Symbol.iterator](), 'swapped');
});

QUnit.test('computed optional symbol key keeps its receiver and skips nullish keys', assert => {
  let arr = ['held'];
  assert.same(arr?.[(arr = ['swapped'], Symbol.iterator)]().next().value, 'held');
  assert.same(arr[0], 'swapped');
  const empty = null;
  let keys = 0;
  assert.same(empty?.[(keys++, Symbol.iterator)]().next().value, undefined);
  assert.same(keys, 0);
});

QUnit.test('sealed computed optional symbol key keeps its original receiver', assert => {
  let arr = ['held'];
  // eslint-disable-next-line no-unsafe-optional-chaining -- the captured receiver is non-null
  assert.same((arr?.[(arr = ['swapped'], Symbol.iterator)])().next().value, 'held');
  assert.same(arr[0], 'swapped');
});

QUnit.test('iterator method getter cannot replace the argument-call receiver', assert => {
  let arr = ['held'];
  Object.defineProperty(arr, Symbol.iterator, {
    get() {
      arr = ['swapped'];
      return function (index) {
        return { next: () => ({ value: this[index] }) };
      };
    },
  });
  assert.same(arr[Symbol.iterator](0).next().value, 'held');
  assert.same(arr[0], 'swapped');
});

QUnit.test('computed symbol key retains a collapsed proxy receiver hop effect', assert => {
  const realm = Function('return this')();
  const log = [];
  withTemporaryProperty(realm, 'self', realm, () => {
    withTemporaryProperty(realm, Symbol.iterator, () => ['held'][Symbol.iterator](), () => {
      const iterator = globalThis[(log.push('hop'), 'self')][(log.push('key'), Symbol.iterator)]();
      assert.same(iterator.next().value, 'held');
      assert.deepEqual(log, ['hop', 'key']);
    });
  });
});

QUnit.test('computed symbol key retains a sealed proxy receiver prefix and hop effect', assert => {
  const realm = Function('return this')();
  const log = [];
  withTemporaryProperty(realm, 'self', realm, () => {
    withTemporaryProperty(realm, 'window', realm, () => {
      withTemporaryProperty(realm, Symbol.iterator, () => ['held'][Symbol.iterator](), () => {
        // eslint-disable-next-line no-unsafe-optional-chaining -- the built realm has a non-null self slot
        const iterator = (log.push('prefix'), globalThis?.[(log.push('hop'), 'self')]).window[
          (log.push('key'), Symbol.iterator)
        ]();
        assert.same(iterator.next().value, 'held');
        assert.deepEqual(log, ['prefix', 'hop', 'key']);
      });
    });
  });
});

QUnit.test('aliased symbol consumption keeps folded receiver effects once', assert => {
  const realm = Function('return this')();
  const iteratorKey = Symbol.iterator;
  const log = [];
  function getRealm() {
    log.push('receiver');
    return globalThis;
  }
  withTemporaryProperty(realm, 'self', realm, () => {
    withTemporaryProperty(realm, iteratorKey, () => ['held'][Symbol.iterator](), () => {
      const iterator = (log.push('prefix'), getRealm()[(log.push('hop'), 'self')])[iteratorKey]();
      assert.same(iterator.next().value, 'held');
      assert.deepEqual(log, ['prefix', 'receiver', 'hop']);
    });
  });
});

QUnit.test('aliased symbol argument call keeps folded receiver effects once', assert => {
  const realm = Function('return this')();
  const iteratorKey = Symbol.iterator;
  const log = [];
  function getRealm() {
    log.push('receiver');
    return globalThis;
  }
  withTemporaryProperty(realm, 'self', realm, () => {
    withTemporaryProperty(realm, iteratorKey, function (value) {
      assert.same(this, realm);
      return { next: () => ({ value }) };
    }, () => {
      const iterator = (log.push('prefix'), getRealm()[(log.push('hop'), 'self')])[iteratorKey]('held');
      assert.same(iterator.next().value, 'held');
      assert.deepEqual(log, ['prefix', 'receiver', 'hop']);
    });
  });
});

QUnit.test('sealed aliased symbol consumption keeps captured receiver effects once', assert => {
  const realm = Function('return this')();
  const iteratorKey = Symbol.iterator;
  const log = [];
  function getRealm() {
    log.push('receiver');
    return globalThis;
  }
  withTemporaryProperty(realm, 'self', realm, () => {
    withTemporaryProperty(realm, iteratorKey, () => ['held'][Symbol.iterator](), () => {
      // eslint-disable-next-line no-unsafe-optional-chaining -- the built realm receiver is non-null
      const iterator = (getRealm()[(log.push('hop'), 'self')]?.[iteratorKey])();
      assert.same(iterator.next().value, 'held');
      assert.deepEqual(log, ['receiver', 'hop']);
    });
  });
});

QUnit.test('sealed aliased symbol argument call keeps captured receiver effects once', assert => {
  const realm = Function('return this')();
  const iteratorKey = Symbol.iterator;
  const log = [];
  function getRealm() {
    log.push('receiver');
    return globalThis;
  }
  withTemporaryProperty(realm, 'self', realm, () => {
    withTemporaryProperty(realm, iteratorKey, function (value) {
      assert.same(this, realm);
      return { next: () => ({ value }) };
    }, () => {
      // eslint-disable-next-line no-unsafe-optional-chaining -- the built realm receiver is non-null
      const iterator = (getRealm()[(log.push('hop'), 'self')]?.[iteratorKey])('held');
      assert.same(iterator.next().value, 'held');
      assert.deepEqual(log, ['receiver', 'hop']);
    });
  });
});

QUnit.test('sealed aliased symbol argument call evaluates its receiver before key effects', assert => {
  const iteratorKey = Symbol.iterator;
  const log = [];
  const box = {
    get list() {
      log.push('receiver');
      return ['held'];
    },
  };
  // eslint-disable-next-line no-unsafe-optional-chaining -- the getter returns a non-null array
  const iterator = ((log.push('prefix'), box.list)?.[(log.push('key'), iteratorKey)])(0);
  assert.same(iterator.next().value, 'held');
  assert.deepEqual(log, ['prefix', 'receiver', 'key']);
});
