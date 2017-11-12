import { GLOBAL, DESCRIPTORS, PROTO } from '../helpers/constants';
import { createIterable } from '../helpers/helpers';

var Promise = core.Promise;
var Symbol = core.Symbol;
var bind = core.Function.bind;
var setPrototypeOf = core.Object.setPrototypeOf;
var create = core.Object.create;

QUnit.test('Promise', function (assert) {
  assert.isFunction(Promise);
  assert.throws(function () {
    Promise();
  }, 'throws w/o `new`');
  new Promise(function (resolve, reject) {
    assert.isFunction(resolve, 'resolver is function');
    assert.isFunction(reject, 'rejector is function');
    assert.same(this, undefined, 'correct executor context');
  });
});

if (DESCRIPTORS) QUnit.test('Promise operations order', function (assert) {
  var resolve, resolve2;
  assert.expect(1);
  var EXPECTED_ORDER = 'DEHAFGBC';
  var async = assert.async();
  var result = '';
  var promise1 = new Promise(function (r) {
    resolve = r;
  });
  resolve({
    then: function () {
      result += 'A';
      throw Error();
    }
  });
  promise1.catch(function () {
    result += 'B';
  });
  promise1.catch(function () {
    result += 'C';
    assert.same(result, EXPECTED_ORDER);
    async();
  });
  var promise2 = new Promise(function (r) {
    resolve2 = r;
  });
  resolve2(Object.defineProperty({}, 'then', {
    get: function () {
      result += 'D';
      throw Error();
    }
  }));
  result += 'E';
  promise2.catch(function () {
    result += 'F';
  });
  promise2.catch(function () {
    result += 'G';
  });
  result += 'H';
  setTimeout(function () {
    if (~result.indexOf('C')) {
      assert.same(result, EXPECTED_ORDER);
    }
  }, 1e3);
});

QUnit.test('Promise#then', function (assert) {
  var FakePromise1, FakePromise2;
  assert.isFunction(Promise.prototype.then);
  assert.nonEnumerable(Promise.prototype, 'then');
  var promise = new Promise(function (resolve) {
    resolve(42);
  });
  FakePromise1 = promise.constructor = function (executor) {
    executor(function () { /* empty */ }, function () { /* empty */ });
  };
  FakePromise2 = FakePromise1[Symbol.species] = function (executor) {
    executor(function () { /* empty */ }, function () { /* empty */ });
  };
  assert.ok(promise.then(function () { /* empty */ }) instanceof FakePromise2, 'subclassing, @@species pattern');
  promise = new Promise(function (resolve) {
    resolve(42);
  });
  promise.constructor = FakePromise1 = function (executor) {
    executor(function () { /* empty */ }, function () { /* empty */ });
  };
  assert.ok(promise.then(function () { /* empty */ }) instanceof Promise, 'subclassing, incorrect `this` pattern');
  promise = new Promise(function (resolve) {
    resolve(42);
  });
  promise.constructor = FakePromise1 = function (executor) {
    executor(function () { /* empty */ }, function () { /* empty */ });
  };
  FakePromise1[Symbol.species] = function () { /* empty */ };
  assert.throws(function () {
    promise.then(function () { /* empty */ });
  }, 'NewPromiseCapability validations, #1');
  FakePromise1[Symbol.species] = function (executor) {
    executor(null, function () { /* empty */ });
  };
  assert.throws(function () {
    promise.then(function () { /* empty */ });
  }, 'NewPromiseCapability validations, #2');
  FakePromise1[Symbol.species] = function (executor) {
    executor(function () { /* empty */ }, null);
  };
  assert.throws(function () {
    promise.then(function () { /* empty */ });
  }, 'NewPromiseCapability validations, #3');
});

QUnit.test('Promise#catch', function (assert) {
  var FakePromise1, FakePromise2;
  assert.isFunction(Promise.prototype.catch);
  assert.nonEnumerable(Promise.prototype, 'catch');
  var promise = new Promise(function (resolve) {
    resolve(42);
  });
  FakePromise1 = promise.constructor = function (executor) {
    executor(function () { /* empty */ }, function () { /* empty */ });
  };
  FakePromise2 = FakePromise1[Symbol.species] = function (executor) {
    executor(function () { /* empty */ }, function () { /* empty */ });
  };
  assert.ok(promise.catch(function () { /* empty */ }) instanceof FakePromise2, 'subclassing, @@species pattern');
  promise = new Promise(function (resolve) {
    resolve(42);
  });
  promise.constructor = FakePromise1 = function (executor) {
    executor(function () { /* empty */ }, function () { /* empty */ });
  };
  assert.ok(promise.catch(function () { /* empty */ }) instanceof Promise, 'subclassing, incorrect `this` pattern');
  promise = new Promise(function (resolve) {
    resolve(42);
  });
  promise.constructor = FakePromise1 = function (executor) {
    executor(function () { /* empty */ }, function () { /* empty */ });
  };
  FakePromise1[Symbol.species] = function () { /* empty */ };
  assert.throws(function () {
    promise.catch(function () { /* empty */ });
  }, 'NewPromiseCapability validations, #1');
  FakePromise1[Symbol.species] = function (executor) {
    executor(null, function () { /* empty */ });
  };
  assert.throws(function () {
    promise.catch(function () { /* empty */ });
  }, 'NewPromiseCapability validations, #2');
  FakePromise1[Symbol.species] = function (executor) {
    executor(function () { /* empty */ }, null);
  };
  assert.throws(function () {
    promise.catch(function () { /* empty */ });
  }, 'NewPromiseCapability validations, #3');
  assert.same(Promise.prototype.catch.call({
    then: function (x, y) {
      return y;
    }
  }, 42), 42, 'calling `.then`');
});

QUnit.test('Promise#@@toStringTag', function (assert) {
  assert.ok(Promise.prototype[Symbol.toStringTag] === 'Promise', 'Promise::@@toStringTag is `Promise`');
});

QUnit.test('Promise.all', function (assert) {
  var FakePromise1, FakePromise2, FakePromise3;
  var all = Promise.all;
  assert.isFunction(all);
  assert.arity(all, 1);
  var iterable = createIterable([1, 2, 3]);
  Promise.all(iterable).catch(function () { /* empty */ });
  assert.ok(iterable.received, 'works with iterables: iterator received');
  assert.ok(iterable.called, 'works with iterables: next called');
  var array = [];
  var done = false;
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return core.getIteratorMethod([]).call(this);
  };
  Promise.all(array);
  assert.ok(done);
  assert.throws(function () {
    all.call(null, []).catch(function () { /* empty */ });
  }, TypeError, 'throws without context');
  done = false;
  var resolve = Promise.resolve;
  try {
    Promise.resolve = function () {
      throw new Error();
    };
    Promise.all(createIterable([1, 2, 3], {
      'return': function () {
        done = true;
      }
    })).catch(function () { /* empty */ });
  } catch (e) { /* empty */ }
  Promise.resolve = resolve;
  assert.ok(done, 'iteration closing');
  FakePromise1 = function (executor) {
    executor(function () { /* empty */ }, function () { /* empty */ });
  };
  FakePromise2 = FakePromise1[Symbol.species] = function (executor) {
    executor(function () { /* empty */ }, function () { /* empty */ });
  };
  FakePromise1.resolve = FakePromise2.resolve = bind(Promise.resolve, Promise);
  assert.ok(all.call(FakePromise1, [1, 2, 3]) instanceof FakePromise1, 'subclassing, `this` pattern');
  FakePromise1 = function () { /* empty */ };
  FakePromise2 = function (executor) {
    executor(null, function () { /* empty */ });
  };
  FakePromise3 = function (executor) {
    executor(function () { /* empty */ }, null);
  };
  FakePromise1.resolve = FakePromise2.resolve = FakePromise3.resolve = bind(Promise.resolve, Promise);
  assert.throws(function () {
    all.call(FakePromise1, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #1');
  assert.throws(function () {
    all.call(FakePromise2, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #2');
  assert.throws(function () {
    all.call(FakePromise3, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #3');
});

QUnit.test('Promise.race', function (assert) {
  var FakePromise1, FakePromise2, FakePromise3;
  var race = Promise.race;
  assert.isFunction(race);
  assert.arity(race, 1);
  var iterable = createIterable([1, 2, 3]);
  Promise.race(iterable).catch(function () { /* empty */ });
  assert.ok(iterable.received, 'works with iterables: iterator received');
  assert.ok(iterable.called, 'works with iterables: next called');
  var array = [];
  var done = false;
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return core.getIteratorMethod([]).call(this);
  };
  Promise.race(array);
  assert.ok(done);
  assert.throws(function () {
    race.call(null, []).catch(function () { /* empty */ });
  }, TypeError, 'throws without context');
  done = false;
  var resolve = Promise.resolve;
  try {
    Promise.resolve = function () {
      throw new Error();
    };
    Promise.race(createIterable([1, 2, 3], {
      'return': function () {
        done = true;
      }
    })).catch(function () { /* empty */ });
  } catch (e) { /* empty */ }
  Promise.resolve = resolve;
  assert.ok(done, 'iteration closing');
  FakePromise1 = function (executor) {
    executor(function () { /* empty */ }, function () { /* empty */ });
  };
  FakePromise2 = FakePromise1[Symbol.species] = function (executor) {
    executor(function () { /* empty */ }, function () { /* empty */ });
  };
  FakePromise1.resolve = FakePromise2.resolve = bind(Promise.resolve, Promise);
  assert.ok(race.call(FakePromise1, [1, 2, 3]) instanceof FakePromise1, 'subclassing, `this` pattern');
  FakePromise1 = function () { /* empty */ };
  FakePromise2 = function (executor) {
    executor(null, function () { /* empty */ });
  };
  FakePromise3 = function (executor) {
    executor(function () { /* empty */ }, null);
  };
  FakePromise1.resolve = FakePromise2.resolve = FakePromise3.resolve = bind(Promise.resolve, Promise);
  assert.throws(function () {
    race.call(FakePromise1, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #1');
  assert.throws(function () {
    race.call(FakePromise2, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #2');
  assert.throws(function () {
    race.call(FakePromise3, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #3');
});

QUnit.test('Promise.resolve', function (assert) {
  var resolve = Promise.resolve;
  assert.isFunction(resolve);
  assert.throws(function () {
    resolve.call(null, 1).catch(function () { /* empty */ });
  }, TypeError, 'throws without context');
  function FakePromise1(executor) {
    executor(function () { /* empty */ }, function () { /* empty */ });
  }
  FakePromise1[Symbol.species] = function (executor) {
    executor(function () { /* empty */ }, function () { /* empty */ });
  };
  assert.ok(resolve.call(FakePromise1, 42) instanceof FakePromise1, 'subclassing, `this` pattern');
  assert.throws(function () {
    resolve.call(function () { /* empty */ }, 42);
  }, 'NewPromiseCapability validations, #1');
  assert.throws(function () {
    resolve.call(function (executor) {
      executor(null, function () { /* empty */ });
    }, 42);
  }, 'NewPromiseCapability validations, #2');
  assert.throws(function () {
    resolve.call(function (executor) {
      executor(function () { /* empty */ }, null);
    }, 42);
  }, 'NewPromiseCapability validations, #3');
});

QUnit.test('Promise.reject', function (assert) {
  var reject = Promise.reject;
  assert.isFunction(reject);
  assert.throws(function () {
    reject.call(null, 1).catch(function () { /* empty */ });
  }, TypeError, 'throws without context');
  function FakePromise1(executor) {
    executor(function () { /* empty */ }, function () { /* empty */ });
  }
  FakePromise1[Symbol.species] = function (executor) {
    executor(function () { /* empty */ }, function () { /* empty */ });
  };
  assert.ok(reject.call(FakePromise1, 42) instanceof FakePromise1, 'subclassing, `this` pattern');
  assert.throws(function () {
    reject.call(function () { /* empty */ }, 42);
  }, 'NewPromiseCapability validations, #1');
  assert.throws(function () {
    reject.call(function (executor) {
      executor(null, function () { /* empty */ });
    }, 42);
  }, 'NewPromiseCapability validations, #2');
  assert.throws(function () {
    reject.call(function (executor) {
      executor(function () { /* empty */ }, null);
    }, 42);
  }, 'NewPromiseCapability validations, #3');
});

if (PROTO) QUnit.test('Promise subclassing', function (assert) {
  function SubPromise(executor) {
    var self = new Promise(executor);
    setPrototypeOf(self, SubPromise.prototype);
    self.mine = 'subclass';
    return self;
  }
  setPrototypeOf(SubPromise, Promise);
  SubPromise.prototype = create(Promise.prototype);
  SubPromise.prototype.constructor = SubPromise;
  var promise1 = SubPromise.resolve(5);
  assert.strictEqual(promise1.mine, 'subclass');
  promise1 = promise1.then(function (it) {
    assert.strictEqual(it, 5);
  });
  assert.strictEqual(promise1.mine, 'subclass');
  var promise2 = new SubPromise(function (resolve) {
    resolve(6);
  });
  assert.strictEqual(promise2.mine, 'subclass');
  promise2 = promise2.then(function (it) {
    assert.strictEqual(it, 6);
  });
  assert.strictEqual(promise2.mine, 'subclass');
  var promise3 = SubPromise.all([promise1, promise2]);
  assert.strictEqual(promise3.mine, 'subclass');
  assert.ok(promise3 instanceof Promise);
  assert.ok(promise3 instanceof SubPromise);
  promise3.then(assert.async(), function (it) {
    assert.ok(it, false);
  });
});

QUnit.test('Unhandled rejection tracking', function (assert) {
  var done = false;
  var start = assert.async();
  if (GLOBAL.process) {
    assert.expect(3);
    var onunhandledrejection = function (reason, promise) {
      process.removeListener('unhandledRejection', onunhandledrejection);
      assert.same(promise, $promise, 'unhandledRejection, promise');
      assert.same(reason, 42, 'unhandledRejection, reason');
      $promise.catch(function () { /* empty */ });
    };
    var onrejectionhandled = function (promise) {
      process.removeListener('rejectionHandled', onrejectionhandled);
      assert.same(promise, $promise, 'rejectionHandled, promise');
      done || start();
      done = true;
    };
    process.on('unhandledRejection', onunhandledrejection);
    process.on('rejectionHandled', onrejectionhandled);
  } else {
    assert.expect(4);
    GLOBAL.onunhandledrejection = function (it) {
      assert.same(it.promise, $promise, 'onunhandledrejection, promise');
      assert.same(it.reason, 42, 'onunhandledrejection, reason');
      setTimeout(function () {
        $promise.catch(function () { /* empty */ });
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
  Promise.reject(43).catch(function () { /* empty */ });
  var $promise = Promise.reject(42);
  setTimeout(function () {
    done || start();
    done = true;
  }, 3e3);
});
