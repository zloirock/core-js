import parseInt from '../../packages/core-js-pure/fn/number/parse-int';

QUnit.test('Number.parseInt', assert => {
  assert.isFunction(parseInt);
  assert.arity(parseInt, 2);
  for (let radix = 2; radix <= 36; ++radix) {
    assert.same(parseInt('10', radix), radix, `radix ${ radix }`);
  }
  const strings = ['01', '08', '10', '42'];
  for (const string of strings) {
    assert.same(parseInt(string), parseInt(string, 10), `default radix is 10: ${ string }`);
  }
  assert.same(parseInt('0x16'), parseInt('0x16', 16), 'default radix is 16: 0x16');
  // eslint-disable-next-line max-len
  const whitespaces = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';
  assert.same(parseInt('  0x16'), parseInt('0x16', 16), 'ignores leading whitespace #1');
  assert.same(parseInt('  42'), parseInt('42', 10), 'ignores leading whitespace #2');
  assert.same(parseInt('  08'), parseInt('08', 10), 'ignores leading whitespace #3');
  assert.same(parseInt(`${ whitespaces }08`), parseInt('08', 10), 'ignores leading whitespace #4');
  assert.same(parseInt(`${ whitespaces }0x16`), parseInt('0x16', 16), 'ignores leading whitespace #5');
  const fakeZero = {
    valueOf() {
      return 0;
    },
  };
  assert.same(parseInt('08', fakeZero), parseInt('08', 10), 'valueOf #1');
  assert.same(parseInt('0x16', fakeZero), parseInt('0x16', 16), 'valueOf #2');
  assert.same(parseInt('-0xF'), -15, 'signed hex #1');
  assert.same(parseInt('-0xF', 16), -15, 'signed hex #2');
  assert.same(parseInt('+0xF'), 15, 'signed hex #3');
  assert.same(parseInt('+0xF', 16), 15, 'signed hex #4');
  assert.same(parseInt('10', -4294967294), 2, 'radix uses ToUint32');
  assert.same(parseInt(null), NaN);
  assert.same(parseInt(undefined), NaN);
});
