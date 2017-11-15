import { DESCRIPTORS, GLOBAL, NATIVE, PROTO } from '../helpers/constants';
import { createIterable } from '../helpers/helpers';

const Symbol = GLOBAL.Symbol || {};
const { setPrototypeOf, create } = Object;

QUnit.test('Promise', assert => {
  assert.isFunction(Promise);
  assert.arity(Promise, 1);
  assert.name(Promise, 'Promise');
  assert.looksNative(Promise);
  assert.throws(() => {
    Promise();
  }, 'throws w/o `new`');
  new Promise(function (resolve, reject) {
    assert.isFunction(resolve, 'resolver is function');
    assert.isFunction(reject, 'rejector is function');
    assert.same(this, undefined, 'correct executor context');
  });
});

if (DESCRIPTORS) QUnit.test('Promise operations order', assert => {
  let resolve, resolve2;
  assert.expect(1);
  const EXPECTED_ORDER = 'DEHAFGBC';
  const async = assert.async();
  let result = '';
  const promise1 = new Promise(r => {
    resolve = r;
  });
  resolve({
    then() {
      result += 'A';
      throw Error();
    }
  });
  promise1.catch(() => {
    result += 'B';
  });
  promise1.catch(() => {
    result += 'C';
    assert.same(result, EXPECTED_ORDER);
    async();
  });
  const promise2 = new Promise(r => {
    resolve2 = r;
  });
  resolve2(Object.defineProperty({}, 'then', {
    get() {
      result += 'D';
      throw Error();
    }
  }));
  result += 'E';
  promise2.catch(() => {
    result += 'F';
  });
  promise2.catch(() => {
    result += 'G';
  });
  result += 'H';
  setTimeout(() => {
    if (~result.indexOf('C')) {
      assert.same(result, EXPECTED_ORDER);
    }
  }, 1e3);
});

QUnit.test('Promise#then', assert => {
  assert.isFunction(Promise.prototype.then);
  if (NATIVE) assert.arity(Promise.prototype.then, 2);
  assert.name(Promise.prototype.then, 'then');
  assert.looksNative(Promise.prototype.then);
  assert.nonEnumerable(Promise.prototype, 'then');
  let promise = new Promise(resolve => {
    resolve(42);
  });
  let FakePromise1 = promise.constructor = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  const FakePromise2 = FakePromise1[Symbol.species] = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  assert.ok(promise.then(() => { /* empty */ }) instanceof FakePromise2, 'subclassing, @@species pattern');
  promise = new Promise(resolve => {
    resolve(42);
  });
  promise.constructor = FakePromise1 = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  assert.ok(promise.then(() => { /* empty */ }) instanceof Promise, 'subclassing, incorrect `this` pattern');
  promise = new Promise(resolve => {
    resolve(42);
  });
  promise.constructor = FakePromise1 = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  FakePromise1[Symbol.species] = function () { /* empty */ };
  assert.throws(() => {
    promise.then(() => { /* empty */ });
  }, 'NewPromiseCapability validations, #1');
  FakePromise1[Symbol.species] = function (executor) {
    executor(null, () => { /* empty */ });
  };
  assert.throws(() => {
    promise.then(() => { /* empty */ });
  }, 'NewPromiseCapability validations, #2');
  FakePromise1[Symbol.species] = function (executor) {
    executor(() => { /* empty */ }, null);
  };
  assert.throws(() => {
    promise.then(() => { /* empty */ });
  }, 'NewPromiseCapability validations, #3');
});

QUnit.test('Promise#catch', assert => {
  assert.isFunction(Promise.prototype.catch);
  if (NATIVE) assert.arity(Promise.prototype.catch, 1);
  if (NATIVE) assert.name(Promise.prototype.catch, 'catch');
  assert.looksNative(Promise.prototype.catch);
  assert.nonEnumerable(Promise.prototype, 'catch');
  let promise = new Promise(resolve => {
    resolve(42);
  });
  let FakePromise1 = promise.constructor = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  const FakePromise2 = FakePromise1[Symbol.species] = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  assert.ok(promise.catch(() => { /* empty */ }) instanceof FakePromise2, 'subclassing, @@species pattern');
  promise = new Promise(resolve => {
    resolve(42);
  });
  promise.constructor = FakePromise1 = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  assert.ok(promise.catch(() => { /* empty */ }) instanceof Promise, 'subclassing, incorrect `this` pattern');
  promise = new Promise(resolve => {
    resolve(42);
  });
  promise.constructor = FakePromise1 = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  FakePromise1[Symbol.species] = function () { /* empty */ };
  assert.throws(() => {
    promise.catch(() => { /* empty */ });
  }, 'NewPromiseCapability validations, #1');
  FakePromise1[Symbol.species] = function (executor) {
    executor(null, () => { /* empty */ });
  };
  assert.throws(() => {
    promise.catch(() => { /* empty */ });
  }, 'NewPromiseCapability validations, #2');
  FakePromise1[Symbol.species] = function (executor) {
    executor(() => { /* empty */ }, null);
  };
  assert.throws(() => {
    promise.catch(() => { /* empty */ });
  }, 'NewPromiseCapability validations, #3');
  assert.same(Promise.prototype.catch.call({
    then(x, y) {
      return y;
    }
  }, 42), 42, 'calling `.then`');
});

QUnit.test('Promise#@@toStringTag', assert => {
  assert.ok(Promise.prototype[Symbol.toStringTag] === 'Promise', 'Promise::@@toStringTag is `Promise`');
});

QUnit.test('Promise.all', assert => {
  let FakePromise1, FakePromise2;
  const { all, resolve } = Promise;
  assert.isFunction(all);
  assert.arity(all, 1);
  assert.name(all, 'all');
  assert.looksNative(all);
  assert.nonEnumerable(Promise, 'all');
  const iterable = createIterable([1, 2, 3]);
  Promise.all(iterable).catch(() => { /* empty */ });
  assert.ok(iterable.received, 'works with iterables: iterator received');
  assert.ok(iterable.called, 'works with iterables: next called');
  const array = [];
  let done = false;
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return [][Symbol.iterator].call(this);
  };
  Promise.all(array);
  assert.ok(done);
  assert.throws(() => {
    all.call(null, []).catch(() => { /* empty */ });
  }, TypeError, 'throws without context');
  done = false;
  try {
    Promise.resolve = function () {
      throw new Error();
    };
    Promise.all(createIterable([1, 2, 3], {
      return() {
        done = true;
      }
    })).catch(() => { /* empty */ });
  } catch (e) { /* empty */ }
  Promise.resolve = resolve;
  assert.ok(done, 'iteration closing');
  FakePromise1 = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  FakePromise2 = FakePromise1[Symbol.species] = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  FakePromise1.resolve = FakePromise2.resolve = Promise.resolve.bind(Promise);
  assert.ok(all.call(FakePromise1, [1, 2, 3]) instanceof FakePromise1, 'subclassing, `this` pattern');
  FakePromise1 = function () { /* empty */ };
  FakePromise2 = function (executor) {
    executor(null, () => { /* empty */ });
  };
  const FakePromise3 = function (executor) {
    executor(() => { /* empty */ }, null);
  };
  FakePromise1.resolve = FakePromise2.resolve = FakePromise3.resolve = Promise.resolve.bind(Promise);
  assert.throws(() => {
    all.call(FakePromise1, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #1');
  assert.throws(() => {
    all.call(FakePromise2, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #2');
  assert.throws(() => {
    all.call(FakePromise3, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #3');
});

QUnit.test('Promise.race', assert => {
  let FakePromise1, FakePromise2;
  const { race, resolve } = Promise;
  assert.isFunction(race);
  assert.arity(race, 1);
  assert.name(race, 'race');
  assert.looksNative(race);
  assert.nonEnumerable(Promise, 'race');
  const iterable = createIterable([1, 2, 3]);
  Promise.race(iterable).catch(() => { /* empty */ });
  assert.ok(iterable.received, 'works with iterables: iterator received');
  assert.ok(iterable.called, 'works with iterables: next called');
  const array = [];
  let done = false;
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return [][Symbol.iterator].call(this);
  };
  Promise.race(array);
  assert.ok(done);
  assert.throws(() => {
    race.call(null, []).catch(() => { /* empty */ });
  }, TypeError, 'throws without context');
  done = false;
  try {
    Promise.resolve = function () {
      throw new Error();
    };
    Promise.race(createIterable([1, 2, 3], {
      return() {
        done = true;
      }
    })).catch(() => { /* empty */ });
  } catch (e) { /* empty */ }
  Promise.resolve = resolve;
  assert.ok(done, 'iteration closing');
  FakePromise1 = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  FakePromise2 = FakePromise1[Symbol.species] = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  FakePromise1.resolve = FakePromise2.resolve = Promise.resolve.bind(Promise);
  assert.ok(race.call(FakePromise1, [1, 2, 3]) instanceof FakePromise1, 'subclassing, `this` pattern');
  FakePromise1 = function () { /* empty */ };
  FakePromise2 = function (executor) {
    executor(null, () => { /* empty */ });
  };
  const FakePromise3 = function (executor) {
    executor(() => { /* empty */ }, null);
  };
  FakePromise1.resolve = FakePromise2.resolve = FakePromise3.resolve = Promise.resolve.bind(Promise);
  assert.throws(() => {
    race.call(FakePromise1, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #1');
  assert.throws(() => {
    race.call(FakePromise2, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #2');
  assert.throws(() => {
    race.call(FakePromise3, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #3');
});

QUnit.test('Promise.resolve', assert => {
  const { resolve } = Promise;
  assert.isFunction(resolve);
  if (NATIVE) assert.arity(resolve, 1);
  assert.name(resolve, 'resolve');
  assert.looksNative(resolve);
  assert.nonEnumerable(Promise, 'resolve');
  assert.throws(() => {
    resolve.call(null, 1).catch(() => { /* empty */ });
  }, TypeError, 'throws without context');
  function FakePromise1(executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  }
  FakePromise1[Symbol.species] = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  assert.ok(resolve.call(FakePromise1, 42) instanceof FakePromise1, 'subclassing, `this` pattern');
  assert.throws(() => {
    resolve.call(() => { /* empty */ }, 42);
  }, 'NewPromiseCapability validations, #1');
  assert.throws(() => {
    resolve.call(executor => {
      executor(null, () => { /* empty */ });
    }, 42);
  }, 'NewPromiseCapability validations, #2');
  assert.throws(() => {
    resolve.call(executor => {
      executor(() => { /* empty */ }, null);
    }, 42);
  }, 'NewPromiseCapability validations, #3');
});

QUnit.test('Promise.reject', assert => {
  const { reject } = Promise;
  assert.isFunction(reject);
  if (NATIVE) assert.arity(reject, 1);
  assert.name(reject, 'reject');
  assert.looksNative(reject);
  assert.nonEnumerable(Promise, 'reject');
  assert.throws(() => {
    reject.call(null, 1).catch(() => { /* empty */ });
  }, TypeError, 'throws without context');
  function FakePromise1(executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  }
  FakePromise1[Symbol.species] = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  assert.ok(reject.call(FakePromise1, 42) instanceof FakePromise1, 'subclassing, `this` pattern');
  assert.throws(() => {
    reject.call(() => { /* empty */ }, 42);
  }, 'NewPromiseCapability validations, #1');
  assert.throws(() => {
    reject.call(executor => {
      executor(null, () => { /* empty */ });
    }, 42);
  }, 'NewPromiseCapability validations, #2');
  assert.throws(() => {
    reject.call(executor => {
      executor(() => { /* empty */ }, null);
    }, 42);
  }, 'NewPromiseCapability validations, #3');
});

if (PROTO) QUnit.test('Promise subclassing', assert => {
  function SubPromise(executor) {
    const self = new Promise(executor);
    setPrototypeOf(self, SubPromise.prototype);
    self.mine = 'subclass';
    return self;
  }
  setPrototypeOf(SubPromise, Promise);
  SubPromise.prototype = create(Promise.prototype);
  SubPromise.prototype.constructor = SubPromise;
  let promise1 = SubPromise.resolve(5);
  assert.strictEqual(promise1.mine, 'subclass');
  promise1 = promise1.then(it => {
    assert.strictEqual(it, 5);
  });
  assert.strictEqual(promise1.mine, 'subclass');
  let promise2 = new SubPromise(resolve => {
    resolve(6);
  });
  assert.strictEqual(promise2.mine, 'subclass');
  promise2 = promise2.then(it => {
    assert.strictEqual(it, 6);
  });
  assert.strictEqual(promise2.mine, 'subclass');
  const promise3 = SubPromise.all([promise1, promise2]);
  assert.strictEqual(promise3.mine, 'subclass');
  assert.ok(promise3 instanceof Promise);
  assert.ok(promise3 instanceof SubPromise);
  promise3.then(assert.async(), it => {
    assert.ok(it, false);
  });
});

QUnit.test('Unhandled rejection tracking', assert => {
  let done = false;
  const start = assert.async();
  if (GLOBAL.process) {
    assert.expect(3);
    function onunhandledrejection(reason, promise) {
      process.removeListener('unhandledRejection', onunhandledrejection);
      assert.same(promise, $promise, 'unhandledRejection, promise');
      assert.same(reason, 42, 'unhandledRejection, reason');
      $promise.catch(() => { /* empty */ });
    }
    function onrejectionhandled(promise) {
      process.removeListener('rejectionHandled', onrejectionhandled);
      assert.same(promise, $promise, 'rejectionHandled, promise');
      done || start();
      done = true;
    }
    process.on('unhandledRejection', onunhandledrejection);
    process.on('rejectionHandled', onrejectionhandled);
  } else {
    assert.expect(4);
    GLOBAL.onunhandledrejection = function (it) {
      assert.same(it.promise, $promise, 'onunhandledrejection, promise');
      assert.same(it.reason, 42, 'onunhandledrejection, reason');
      setTimeout(() => {
        $promise.catch(() => { /* empty */ });
      }, 1);
      GLOBAL.onunhandledrejection = null;
    };
    GLOBAL.onrejectionhandled = function (it) {
      assert.same(it.promise, $promise, 'onrejectionhandled, promise');
      assert.same(it.reason, 42, 'onrejectionhandled, reason');
      GLOBAL.onrejectionhandled = null;
      done || start();
      done = true;
    };
  }
  Promise.reject(43).catch(() => { /* empty */ });
  const $promise = Promise.reject(42);
  setTimeout(() => {
    done || start();
    done = true;
  }, 3e3);
});
