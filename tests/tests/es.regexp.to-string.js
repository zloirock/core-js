import { STRICT } from '../helpers/constants';

QUnit.test('RegExp#toString', assert => {
  const { toString } = RegExp.prototype;
  assert.isFunction(toString);
  assert.arity(toString, 0);
  assert.name(toString, 'toString');
  assert.looksNative(toString);
  assert.nonEnumerable(RegExp.prototype, 'toString');
  assert.same(String(/pattern/), '/pattern/');
  assert.same(String(/pattern/i), '/pattern/i');
  assert.same(String(/pattern/mi), '/pattern/im');
  assert.same(String(/pattern/im), '/pattern/im');
  assert.same(String(/pattern/mgi), '/pattern/gim');
  assert.same(String(new RegExp('pattern')), '/pattern/');
  assert.same(String(new RegExp('pattern', 'i')), '/pattern/i');
  assert.same(String(new RegExp('pattern', 'mi')), '/pattern/im');
  assert.same(String(new RegExp('pattern', 'im')), '/pattern/im');
  assert.same(String(new RegExp('pattern', 'mgi')), '/pattern/gim');
  assert.same(toString.call({
    source: 'foo',
    flags: 'bar',
  }), '/foo/bar');
  assert.same(toString.call({}), '/undefined/undefined');
  if (STRICT) {
    assert.throws(() => {
      return toString.call(7);
    });
    assert.throws(() => {
      return toString.call('a');
    });
    assert.throws(() => {
      return toString.call(false);
    });
    assert.throws(() => {
      return toString.call(null);
    });
    assert.throws(() => {
      return toString.call(undefined);
    });
  }
});
