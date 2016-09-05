{module, test} = QUnit
module \ES7

test 'Promise#finally' (assert)!->
  assert.isFunction Promise::finally
  NATIVE and assert.arity Promise::finally, 2
  assert.looksNative Promise::finally
  assert.nonEnumerable Promise::, \finally
  # subclassing, @@species pattern
  promise = new Promise !-> it 42
  promise@@ = FakePromise1 = !-> it ->, ->
  FakePromise1[Symbol?species] = FakePromise2 = !-> it ->, ->
  assert.ok promise.finally(->) instanceof FakePromise2, 'subclassing, @@species pattern'
  # subclassing, incorrect `this.constructor` pattern
  promise = new Promise !-> it 42
  promise@@ = FakePromise1 = !-> it ->, ->
  assert.ok promise.finally(->) instanceof Promise, 'subclassing, incorrect `this` pattern'
  # NewPromiseCapability validations
  promise = new Promise !-> it 42
  promise@@ = FakePromise1 = !-> it ->, ->
  FakePromise1[Symbol?species] = !->
  assert.throws (!-> promise.finally(->)), 'NewPromiseCapability validations, #1'
  FakePromise1[Symbol?species] = !-> it null, ->
  assert.throws (!-> promise.finally(->)), 'NewPromiseCapability validations, #2'
  FakePromise1[Symbol?species] = !-> it ->, null
  assert.throws (!-> promise.finally(->)), 'NewPromiseCapability validations, #3'
  #
  # when value is returned, test finally is called, then onFulfilled is reached, not onRejected
  # js:
  # var finallyReached1 = false;
  # var expectedValue1 = 1;
  # var p1 = new Promise((resolve, reject) => resolve(expectedValue1));
  # p1 = p1.finally(() => finallyReached1 = true;);
  # p1.then(
  #   val => {
  #     assert.equal(finallyReached1, true);
  #     assert.equal(value, expectedValue1);
  #   },
  #   reason => { assert.fail('onRejected should not be reached') });
  #
  # when exception is thrown, test finally is called, then onRejected is reached, not onFulfilled
  # js:
  # var finallyReached2 = false;
  # var expectedReason1 = 1;
  # var p2 = new Promise((resolve, reject) => reject(expectedReason1));
  # p2 = p2.finally(() => finallyReached2 = true;);
  # p2.then(
  #   val => { assert.fail('onFulfilled should not be reached') },
  #   reason => {
  #     assert.equal(finallyReached2, true);
  #     assert.equal(reason, expectedReason1);
  #   });
  #
  # when onFinally is not a function nothing untoward happens
  # var expectedValue2 = 1;
  # var p1 = new Promise((resolve, reject) => resolve(expectedValue2));
  # p1 = p1.finally(3);
  # p1.then(
  #   val => {
  #     assert.equal(value, expectedValue2);
  #   },
  #   reason => { assert.fail('onRejected should not be reached') });
  # var expectedReason2 = 1;
  # var p2 = new Promise((resolve, reject) => reject(expectedReason2));
  # p2 = p2.finally(3);
  # p2.then(
  #   val => { assert.fail('onFulfilled should not be reached') },
  #   reason => {
  #     assert.equal(reason, expectedReason2);
  #   });
  #
