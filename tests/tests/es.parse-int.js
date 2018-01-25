import { WHITESPACES } from '../helpers/constants';

/* eslint-disable radix */
QUnit.test('parseInt', assert => {
  assert.isFunction(parseInt);
  assert.name(parseInt, 'parseInt');
  assert.arity(parseInt, 2);
  assert.looksNative(parseInt);
  for (let radix = 2; radix <= 36; ++radix) {
    assert.same(parseInt('10', radix), radix, `radix ${ radix }`);
  }
  const strings = ['01', '08', '10', '42'];
  for (const string of strings) {
    assert.same(parseInt(string), parseInt(string, 10), `default radix is 10: ${ string }`);
  }
  assert.same(parseInt('0x16'), parseInt('0x16', 16), 'default radix is 16: 0x16');
  assert.same(parseInt('  0x16'), parseInt('0x16', 16), 'ignores leading whitespace #1');
  assert.same(parseInt('  42'), parseInt('42', 10), 'ignores leading whitespace #2');
  assert.same(parseInt('  08'), parseInt('08', 10), 'ignores leading whitespace #3');
  assert.same(parseInt(`${ WHITESPACES }08`), parseInt('08', 10), 'ignores leading whitespace #4');
  assert.same(parseInt(`${ WHITESPACES }0x16`), parseInt('0x16', 16), 'ignores leading whitespace #5');
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

