import { STRICT } from '../helpers/constants';

import Set from 'core-js-pure/fn/set';

QUnit.test('Set#find', assert => {
  const { find } = Set.prototype;

  assert.isFunction(find);
  assert.arity(find, 1);
  if ('name' in find) assert.name(find, 'find');
  assert.nonEnumerable(Set.prototype, 'find');

  const set = new Set([1]);
  const context = {};
  set.find(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 1, 'correct key in callback');
    assert.same(that, set, 'correct link to set in callback');
    assert.same(this, context, 'correct callback context');
  }, context);

  assert.same(new Set([2, 3, 4]).find(it => it % 2), 3);
  assert.same(new Set().find(it => it === 42), undefined);

  assert.throws(() => find.call({}, () => { /* empty */ }), TypeError);

  if (STRICT) {
    assert.throws(() => find.call(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => find.call(undefined, () => { /* empty */ }), TypeError);
  }
});
