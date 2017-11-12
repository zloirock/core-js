import { GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

QUnit.test('ArrayBuffer.isView', function (assert) {
  var isView = ArrayBuffer.isView;
  assert.isFunction(isView);
  assert.arity(isView, 1);
  assert.name(isView, 'isView');
  assert.looksNative(isView);
  assert.nonEnumerable(ArrayBuffer, 'isView');
  for (var name in TYPED_ARRAYS) {
    if (GLOBAL[name]) {
      assert.same(isView(new GLOBAL[name]([1])), true, name + ' - true');
    }
  }
  assert.same(isView(new DataView(new ArrayBuffer(1))), true, 'DataView - true');
  assert.same(isView(new ArrayBuffer(1)), false, 'ArrayBuffer - false');
  var examples = [undefined, null, false, true, 0, 1, '', 'qwe', {}, [], function () { /* empty */ }];
  for (var i = 0, length = examples.length; i < length; ++i) {
    var example = examples[i];
    assert.same(isView(example), false, example + ' - false');
  }
});
