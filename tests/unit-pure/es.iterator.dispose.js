import Iterator from '@core-js/pure/es/iterator';
import Symbol from '@core-js/pure/es/symbol';

const { create } = Object;

QUnit.test('Iterator#@@dispose', assert => {
  const dispose = Iterator.prototype[Symbol.dispose];
  assert.isFunction(dispose);
  assert.arity(dispose, 0);

  assert.same(create(Iterator.prototype)[Symbol.dispose](), undefined);

  let called = false;
  const iterator2 = create(Iterator.prototype);
  iterator2.return = function () {
    called = true;
    assert.same(this, iterator2);
    return 7;
  };
  assert.same(iterator2[Symbol.dispose](), undefined);
  assert.true(called);
});
