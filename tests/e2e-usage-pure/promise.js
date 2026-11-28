// Promise: constructor + combinators + instance methods (.catch, .finally)
QUnit.test('Promise constructor + then', assert => {
  return new Promise(resolve => resolve(42)).then(v => {
    assert.same(v, 42);
  });
});

QUnit.test('Promise.resolve / reject', assert => {
  return Promise.resolve(1).then(v => {
    assert.same(v, 1);
    throw 'err';
  }).catch(error => {
    assert.same(error, 'err');
  });
});

QUnit.test('Promise.race', assert => {
  let timer;
  return Promise.race([
    new Promise(resolve => {
      timer = setTimeout(() => resolve('slow'), 100);
    }),
    Promise.resolve('fast'),
  ]).then(v => {
    // the slow arm loses by design, and an armed timer keeps node alive for its whole delay
    clearTimeout(timer);
    assert.same(v, 'fast');
  });
});

QUnit.test('Promise.try', assert => {
  return Promise.try(() => 42).then(v => {
    assert.same(v, 42);
  });
});

// rejection paths - happy path covers callback returning a value; the other two
// branches (synchronous throw inside callback, callback returning a rejected
// thenable) must funnel through the returned promise's catch handler rather
// than surface synchronously
QUnit.test('Promise.try with synchronous throw', assert => {
  return Promise.try(() => { throw new Error('sync-throw'); }).catch(error => {
    assert.same(error.message, 'sync-throw');
  });
});

QUnit.test('Promise.try with rejecting thenable result', assert => {
  return Promise.try(() => Promise.reject(new Error('async-reject'))).catch(error => {
    assert.same(error.message, 'async-reject');
  });
});

QUnit.test('Promise.withResolvers', assert => {
  const { promise, resolve } = Promise.withResolvers();
  resolve(99);
  return promise.then(v => {
    assert.same(v, 99);
  });
});

QUnit.test('Promise#finally', assert => {
  let finallyCalled = false;
  return Promise.resolve(1).finally(() => {
    finallyCalled = true;
  }).then(v => {
    assert.same(v, 1);
    assert.true(finallyCalled);
  });
});

QUnit.test('Promise.allSettled', assert => {
  return Promise.allSettled([
    Promise.resolve(1),
    Promise.reject(new Error('fail')),
    Promise.resolve(3),
  ]).then(results => {
    assert.same(results.length, 3);
    assert.same(results[0].status, 'fulfilled');
    assert.same(results[1].status, 'rejected');
  });
});

QUnit.test('Promise.any', assert => {
  return Promise.any([
    Promise.reject(1),
    Promise.resolve(2),
    Promise.resolve(3),
  ]).then(value => {
    assert.same(value, 2);
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
  return Promise.any([
    Promise.reject(new Error('a')),
    Promise.reject(new Error('b')),
    Promise.reject(new Error('c')),
  ]).catch(error => {
    assert.same(error.name, 'AggregateError');
    assert.same(error.errors.length, 3);
    assert.same(error.errors[0].message, 'a');
    assert.same(error.errors[2].message, 'c');
  });
});

QUnit.test('Promise.allSettled + chaining', assert => {
  return Promise.allSettled([Promise.resolve(1), Promise.reject(2)]).then(results => {
    assert.same(results.find(r => r.status === 'fulfilled').value, 1);
  });
});

QUnit.test('Promise constructor with polyfill inside', assert => {
  // eslint-disable-next-line unicorn/prefer-promise-try -- testing
  return new Promise(resolve => {
    resolve(Array.from([1, 2, 3]));
  }).then(arr => {
    assert.deepEqual(arr.filter(x => x > 1), [2, 3]);
  });
});

QUnit.test('Promise.all over Set-deduped array, map with Promise.resolve', assert => {
  // eslint-disable-next-line unicorn/no-duplicate-set-values -- testing
  const deduped = Array.from(new Set([3, 1, 2, 1, 3]));
  return Promise.all(deduped.map(v => Promise.resolve(v * 2))).then(collected => {
    assert.deepEqual(collected, [6, 2, 4]);
  });
});
