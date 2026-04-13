// Promise: constructor + combinators + instance methods (.catch, .finally)
QUnit.test('Promise constructor + then', assert => {
  const async = assert.async();
  new Promise(resolve => resolve(42)).then(v => {
    assert.same(v, 42);
    async();
  });
});

QUnit.test('Promise.resolve / reject', assert => {
  const async = assert.async();
  Promise.resolve(1).then(v => {
    assert.same(v, 1);
    throw 'err';
  }).catch(error => {
    assert.same(error, 'err');
    async();
  });
});

QUnit.test('Promise.race', assert => {
  const async = assert.async();
  Promise.race([
    new Promise(resolve => setTimeout(() => resolve('slow'), 100)),
    Promise.resolve('fast'),
  ]).then(v => {
    assert.same(v, 'fast');
    async();
  });
});

QUnit.test('Promise.try', assert => {
  const async = assert.async();
  Promise.try(() => 42).then(v => {
    assert.same(v, 42);
    async();
  });
});

QUnit.test('Promise.withResolvers', assert => {
  const { promise, resolve } = Promise.withResolvers();
  const async = assert.async();
  resolve(99);
  promise.then(v => {
    assert.same(v, 99);
    async();
  });
});

QUnit.test('Promise#finally', assert => {
  const async = assert.async();
  let finallyCalled = false;
  Promise.resolve(1).finally(() => {
    finallyCalled = true;
  }).then(v => {
    assert.same(v, 1);
    assert.true(finallyCalled);
    async();
  });
});

QUnit.test('Promise.allSettled', assert => {
  const async = assert.async();
  Promise.allSettled([
    Promise.resolve(1),
    Promise.reject(new Error('fail')),
    Promise.resolve(3),
  ]).then(results => {
    assert.same(results.length, 3);
    assert.same(results[0].status, 'fulfilled');
    assert.same(results[1].status, 'rejected');
    async();
  });
});

QUnit.test('Promise.any', assert => {
  const async = assert.async();
  Promise.any([
    Promise.reject(1),
    Promise.resolve(2),
    Promise.resolve(3),
  ]).then(value => {
    assert.same(value, 2);
    async();
  });
});

QUnit.test('Promise.allSettled + chaining', assert => {
  const async = assert.async();
  Promise.allSettled([Promise.resolve(1), Promise.reject(2)]).then(results => {
    assert.same(results.find(r => r.status === 'fulfilled').value, 1);
    async();
  });
});

QUnit.test('Promise constructor with polyfill inside', assert => {
  const async = assert.async();
  new Promise(resolve => {
    resolve(Array.from([1, 2, 3]));
  }).then(arr => {
    assert.deepEqual(arr.filter(x => x > 1), [2, 3]);
    async();
  });
});
