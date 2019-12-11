import iterateKeys from 'core-js-pure/features/object/iterate-keys';
import TO_STRING_TAG from 'core-js-pure/features/symbol/to-string-tag';

QUnit.test('Object.iterateKeys', assert => {
  assert.isFunction(iterateKeys);
  assert.name(iterateKeys, 'iterateKeys');
  assert.arity(iterateKeys, 1);

  const object = {
    q: 1,
    w: 2,
    e: 3,
  };
  const iterator = iterateKeys(object);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[TO_STRING_TAG], 'Object Iterator');
  assert.deepEqual(iterator.next(), {
    value: 'q',
    done: false,
  });
  delete object.w;
  assert.deepEqual(iterator.next(), {
    value: 'e',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
});
