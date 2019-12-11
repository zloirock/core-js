import iterateEntries from 'core-js-pure/features/object/iterate-entries';
import TO_STRING_TAG from 'core-js-pure/features/symbol/to-string-tag';

QUnit.test('Object.iterateEntries', assert => {
  assert.isFunction(iterateEntries);
  assert.name(iterateEntries, 'iterateEntries');
  assert.arity(iterateEntries, 1);

  const object = {
    q: 1,
    w: 2,
    e: 3,
  };
  const iterator = iterateEntries(object);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[TO_STRING_TAG], 'Object Iterator');
  assert.deepEqual(iterator.next(), {
    value: ['q', 1],
    done: false,
  });
  delete object.w;
  assert.deepEqual(iterator.next(), {
    value: ['e', 3],
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
});
