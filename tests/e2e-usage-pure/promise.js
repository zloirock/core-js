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

// rejection paths - happy path covers callback returning a value; the other two
// branches (synchronous throw inside callback, callback returning a rejected
// thenable) must funnel through the returned promise's catch handler rather
// than surface synchronously
QUnit.test('Promise.try with synchronous throw', assert => {
  const async = assert.async();
  Promise.try(() => { throw new Error('sync-throw'); }).catch(error => {
    assert.same(error.message, 'sync-throw');
    async();
  });
});

QUnit.test('Promise.try with rejecting thenable result', assert => {
  const async = assert.async();
  Promise.try(() => Promise.reject(new Error('async-reject'))).catch(error => {
    assert.same(error.message, 'async-reject');
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

// rejection path - when ALL promises reject, `Promise.any` rejects with an
// AggregateError-shaped value whose `.errors` array preserves each input
// rejection in order. structural check only: `instanceof AggregateError` is
// runtime-dependent in pure mode (a native rejection from `Promise.any` may not
// share identity with the polyfilled `AggregateError` constructor when both
// exist). only-success path is covered above; this validates the `.errors`
// shape + reason propagation specific to the all-rejected branch
QUnit.test('Promise.any all-rejected returns AggregateError-shaped reason', assert => {
  const async = assert.async();
  Promise.any([
    Promise.reject(new Error('a')),
    Promise.reject(new Error('b')),
    Promise.reject(new Error('c')),
  ]).catch(error => {
    assert.same(error.name, 'AggregateError');
    assert.same(error.errors.length, 3);
    assert.same(error.errors[0].message, 'a');
    assert.same(error.errors[2].message, 'c');
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

QUnit.test('Promise.all over Set-deduped array, map with Promise.resolve', assert => {
  const async = assert.async();
  const deduped = Array.from(new Set([3, 1, 2, 1, 3]));
  Promise.all(deduped.map(v => Promise.resolve(v * 2))).then(collected => {
    assert.deepEqual(collected, [6, 2, 4]);
    async();
  });
});
