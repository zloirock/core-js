import Promise from '@core-js/pure/es/promise';

QUnit.test('Promise.reject', assert => {
  const { reject } = Promise;
  assert.isFunction(reject);
  assert.name(reject, 'reject');
});

QUnit.test('Promise.reject, rejects with value', assert => {
  return Promise.reject(42)
    .then(() => {
      assert.avoid('Should not resolve');
    }, error => {
      assert.same(error, 42, 'rejected with correct reason');
    });
});

QUnit.test('Promise.reject, rejects with undefined', assert => {
  return Promise.reject()
    .then(() => {
      assert.avoid('Should not resolve');
    }, error => {
      assert.same(error, undefined, 'rejected with correct reason');
    });
});

QUnit.test('Promise.reject, subclassing', assert => {
  const { reject } = Promise;
  function SubPromise(executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  }
  assert.true(reject.call(SubPromise, 42) instanceof SubPromise, 'subclassing, `this` pattern');

  function FakePromise1() { /* empty */ }
  function FakePromise2(executor) {
    executor(null, () => { /* empty */ });
  }
  function FakePromise3(executor) {
    executor(() => { /* empty */ }, null);
  }
  assert.throws(() => {
    reject.call(FakePromise1, 42);
  }, 'NewPromiseCapability validations, #1');
  assert.throws(() => {
    reject.call(FakePromise2, 42);
  }, 'NewPromiseCapability validations, #2');
  assert.throws(() => {
    reject.call(FakePromise3, 42);
  }, 'NewPromiseCapability validations, #3');
});

QUnit.test('Promise.reject, without constructor context', assert => {
  const { reject } = Promise;
  assert.throws(() => reject(''), TypeError, 'Throws if called without a constructor context');
  assert.throws(() => reject.call(null, ''), TypeError, 'Throws if called with null as this');
});
