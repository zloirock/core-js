import { STRICT } from '../helpers/constants';

import Set from 'core-js-pure/fn/set';
import from from 'core-js-pure/fn/array/from';

QUnit.test('Set#filter', assert => {
  const { filter } = Set.prototype;

  assert.isFunction(filter);
  assert.arity(filter, 1);
  if ('name' in filter) assert.name(filter, 'filter');
  assert.nonEnumerable(Set.prototype, 'filter');

  const set = new Set([1]);
  const context = {};
  set.filter(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 1, 'correct key in callback');
    assert.same(that, set, 'correct link to set in callback');
    assert.same(this, context, 'correct callback context');
  }, context);

  assert.deepEqual(from(new Set([1, 2, 3, 'q', {}, 4, true, 5]).filter(it => typeof it === 'number')), [1, 2, 3, 4, 5]);

  assert.throws(() => filter.call({}, () => { /* empty */ }), TypeError);

  if (STRICT) {
    assert.throws(() => filter.call(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => filter.call(undefined, () => { /* empty */ }), TypeError);
  }
});
