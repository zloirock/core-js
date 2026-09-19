import { restoreProperty } from '../../helpers/restore-property.cjs';

// a patch installed THROUGH a parameter is the same patch: the call is what says which object the
// write lands on, so `install(Map)` taints the Map static and the read has to serve the patch.
// before the fix the receiver named no namespace, the write was invisible, and the ponyfill was
// substituted straight over the replacement
QUnit.test('mutated-statics: a patch installed through a parameter wins', assert => {
  function install(target) {
    target.groupBy = function patched() { return 'PARAM-INSTALLED'; };
  }
  const originalDescriptor = Object.getOwnPropertyDescriptor(Map, 'groupBy');

  install(Map);
  try {
    assert.same(Map.groupBy([1], it => it), 'PARAM-INSTALLED');
  } finally {
    restoreProperty(Map, 'groupBy', originalDescriptor);
  }
});
