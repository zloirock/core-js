import EPSILON from 'core-js-pure/features/number/epsilon';

QUnit.test('Number.EPSILON', assert => {
  assert.same(EPSILON, 2 ** -52, 'Is 2^-52');
  assert.notStrictEqual(1, 1 + EPSILON, '1 isnt 1 + EPSILON');
  assert.same(1, 1 + EPSILON / 2, '1 is 1 + EPSILON / 2');
});
