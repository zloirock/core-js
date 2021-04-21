import create from 'core-js-pure/full/object/create';
import hasOwn from 'core-js-pure/full/object/has-own';

QUnit.test('Object.hasOwn', assert => {
  assert.isFunction(hasOwn);
  assert.arity(hasOwn, 2);
  assert.name(hasOwn, 'hasOwn');
  assert.same(hasOwn({ q: 42 }, 'q'), true);
  assert.same(hasOwn({ q: 42 }, 'w'), false);
  assert.same(hasOwn(create({ q: 42 }), 'q'), false);
  assert.same(hasOwn(Object.prototype, 'hasOwnProperty'), true);
  let called = false;
  try {
    hasOwn(null, { toString() { called = true; } });
  } catch { /* empty */ }
  assert.same(called, false, 'modern behaviour');
  assert.throws(() => hasOwn(null, 'foo'), TypeError, 'throws on null');
  assert.throws(() => hasOwn(undefined, 'foo'), TypeError, 'throws on undefined');
});
