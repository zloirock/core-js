import { STRICT } from '../helpers/constants';

import Set from 'core-js-pure/fn/set';

QUnit.test('Set#every', assert => {
  const { every } = Set.prototype;

  assert.isFunction(every);
  assert.arity(every, 1);
  if ('name' in every) assert.name(every, 'every');
  assert.nonEnumerable(Set.prototype, 'every');

  const set = new Set([1]);
  const context = {};
  set.every(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 1, 'correct key in callback');
    assert.same(that, set, 'correct link to set in callback');
    assert.same(this, context, 'correct callback context');
  }, context);

  assert.same(new Set([1, 2, 3]).every(it => typeof it === 'number'), true);
  assert.same(new Set(['1', '2', '3']).some(it => typeof it === 'number'), false);
  assert.same(new Set([1, '2', 3]).every(it => typeof it === 'number'), false);
  assert.same(new Set().every(it => typeof it === 'number'), true);

  assert.throws(() => every.call({}, () => { /* empty */ }), TypeError);

  if (STRICT) {
    assert.throws(() => every.call(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => every.call(undefined, () => { /* empty */ }), TypeError);
  }
});
