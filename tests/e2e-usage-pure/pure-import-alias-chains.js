import Full from '@core-js/pure/full/promise';

QUnit.test('full pure imports through fallback aliases', assert => {
  const order = [];
  const first = (order.push('init'), Full) ?? AggregateError;
  const C = first || Iterator;
  const { withResolvers } = C;
  assert.throws(() => withResolvers(), TypeError);
  const deferred = withResolvers.call(C);
  deferred.resolve(17);
  // eslint-disable-next-line no-sequences -- exercise effects in both the computed key and the argument
  return C[order.push('key'), 'try']((order.push('arg'), () => {
    order.push('call');
    return 23;
  })).then(value => {
    assert.same(value, 23);
    assert.deepEqual(order, ['init', 'key', 'arg', 'call']);
    return deferred.promise;
  }).then(value => {
    assert.same(value, 17);
  });
});
