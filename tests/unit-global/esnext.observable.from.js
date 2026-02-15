QUnit.test('Observable.from', assert => {
  assert.isFunction(Observable.from);
  assert.arity(Observable.from, 1);
  assert.name(Observable.from, 'from');
  assert.looksNative(Observable.from);

  const results1 = [];
  Observable.from([1, 2, 3]).subscribe({ next: v => results1.push(v) });
  assert.deepEqual(results1, [1, 2, 3], 'first subscription receives all values');

  const obs = Observable.from([4, 5, 6]);
  const sub1 = [];
  const sub2 = [];
  obs.subscribe({ next: v => sub1.push(v) });
  obs.subscribe({ next: v => sub2.push(v) });
  assert.deepEqual(sub1, [4, 5, 6], 'multi-subscribe: first subscription');
  assert.deepEqual(sub2, [4, 5, 6], 'multi-subscribe: second subscription gets fresh iterator');
});
