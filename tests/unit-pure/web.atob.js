import { DENO, DENO_VERSION } from '../helpers/constants.js';

// based on https://github.com/davidchambers/Base64.js/blob/master/test/base64.js
import atob from 'core-js-pure/stable/atob';

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
  assert.same(atob(' Z\tm\n9\fv\r '), 'foo', 'ASCII whitespace');

  assert.same(atob(42), atob('42'));
  assert.same(atob(null), atob('null'));

  // Deno 1.0-1.14 throws InvalidCharacterError instead of TypeError without arguments.
  if (!DENO || DENO_VERSION >= 115) assert.throws(() => atob(), TypeError, 'no args');
  assert.throws(() => atob('a'), error => error.name === 'InvalidCharacterError', 'invalid #1');
  assert.throws(() => atob('a '), error => error.name === 'InvalidCharacterError', 'invalid #2');
  assert.throws(() => atob('aaaaa'), error => error.name === 'InvalidCharacterError', 'invalid #3');
  assert.throws(() => atob('[object Object]'), error => error.name === 'InvalidCharacterError', 'invalid #4');
  assert.throws(() => atob('ab=c'), error => error.name === 'InvalidCharacterError', 'padding in the middle');
  assert.throws(() => atob('YQ='), error => error.name === 'InvalidCharacterError', 'incomplete padding');
  assert.throws(() => atob('Zm9v\u00A0'), error => error.name === 'InvalidCharacterError', 'non-ASCII whitespace');
});
