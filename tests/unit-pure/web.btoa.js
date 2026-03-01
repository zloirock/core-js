// based on https://github.com/davidchambers/Base64.js/blob/master/test/base64.js
import btoa from 'core-js-pure/stable/btoa';

QUnit.test('btoa', assert => {
  assert.isFunction(btoa);
  assert.arity(btoa, 1);

  assert.same(btoa(''), '');
  assert.same(btoa('f'), 'Zg==');
  assert.same(btoa('fo'), 'Zm8=');
  assert.same(btoa('foo'), 'Zm9v');
  assert.same(btoa('quux'), 'cXV1eA==');
  assert.same(btoa('!"#$%'), 'ISIjJCU=');
  assert.same(btoa("&'()*+"), 'JicoKSor');
  assert.same(btoa(',-./012'), 'LC0uLzAxMg==');
  assert.same(btoa('3456789:'), 'MzQ1Njc4OTo=');
  assert.same(btoa(';<=>?@ABC'), 'Ozw9Pj9AQUJD');
  assert.same(btoa('DEFGHIJKLM'), 'REVGR0hJSktMTQ==');
  assert.same(btoa('NOPQRSTUVWX'), 'Tk9QUVJTVFVWV1g=');
  assert.same(btoa('YZ[\\]^_`abc'), 'WVpbXF1eX2BhYmM=');
  assert.same(btoa('defghijklmnop'), 'ZGVmZ2hpamtsbW5vcA==');
  assert.same(btoa('qrstuvwxyz{|}~'), 'cXJzdHV2d3h5ent8fX4=');

  assert.same(btoa(42), btoa('42'));
  assert.same(btoa(null), btoa('null'));
  assert.same(btoa({ x: 1 }), btoa('[object Object]'));

  assert.throws(() => btoa(), TypeError, 'no args');
  assert.throws(() => btoa('✈'), 'non-ASCII');
});
