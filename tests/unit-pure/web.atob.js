// based on https://github.com/davidchambers/Base64.js/blob/master/test/base64.js
import atob from '@core-js/pure/stable/atob';

QUnit.test('atob', assert => {
  assert.isFunction(atob);
  assert.arity(atob, 1);

  assert.same(atob(''), '');
  assert.same(atob('Zg=='), 'f');
  assert.same(atob('Zm8='), 'fo');
  assert.same(atob('Zm9v'), 'foo');
  assert.same(atob('cXV1eA=='), 'quux');
  assert.same(atob('ISIjJCU='), '!"#$%');
  assert.same(atob('JicoKSor'), "&'()*+");
  assert.same(atob('LC0uLzAxMg=='), ',-./012');
  assert.same(atob('MzQ1Njc4OTo='), '3456789:');
  assert.same(atob('Ozw9Pj9AQUJD'), ';<=>?@ABC');
  assert.same(atob('REVGR0hJSktMTQ=='), 'DEFGHIJKLM');
  assert.same(atob('Tk9QUVJTVFVWV1g='), 'NOPQRSTUVWX');
  assert.same(atob('WVpbXF1eX2BhYmM='), 'YZ[\\]^_`abc');
  assert.same(atob('ZGVmZ2hpamtsbW5vcA=='), 'defghijklmnop');
  assert.same(atob('cXJzdHV2d3h5ent8fX4='), 'qrstuvwxyz{|}~');
  assert.same(atob(' '), '');

  assert.same(atob(42), atob('42'));
  assert.same(atob(null), atob('null'));

  assert.throws(() => atob(), TypeError, 'no args');
  assert.throws(() => atob('a'), 'invalid #1');
  assert.throws(() => atob('a '), 'invalid #2');
  assert.throws(() => atob('aaaaa'), 'invalid #3');
  assert.throws(() => atob('[object Object]'), 'invalid #4');
});
