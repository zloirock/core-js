import { entries, create, assign } from '../../packages/core-js-pure/fn/object';

QUnit.test('Object.entries', assert => {
  assert.isFunction(entries);
  assert.arity(entries, 1);
  if ('name' in entries) assert.name(entries, 'entries');
  assert.deepEqual(entries({ q: 1, w: 2, e: 3 }), [['q', 1], ['w', 2], ['e', 3]]);
  assert.deepEqual(entries(new String('qwe')), [['0', 'q'], ['1', 'w'], ['2', 'e']]);
  assert.deepEqual(entries(assign(create({ q: 1, w: 2, e: 3 }), { a: 4, s: 5, d: 6 })), [['a', 4], ['s', 5], ['d', 6]]);
  try {
    assert.deepEqual(Function('entries', `
      return entries({ a: 1, get b() {
        delete this.c;
        return 2;
      }, c: 3 });
    `)(entries), [['a', 1], ['b', 2]]);
  } catch (e) { /* empty */ }
  try {
    assert.deepEqual(Function('entries', `
      return entries({ a: 1, get b() {
        Object.defineProperty(this, "c", {
          value: 4,
          enumerable: false
        });
        return 2
      }, c: 3 });
    `)(entries), [['a', 1], ['b', 2]]);
  } catch (e) { /* empty */ }
});
