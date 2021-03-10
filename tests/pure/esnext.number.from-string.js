import fromString from 'core-js-pure/full/number/from-string';

QUnit.test('Number.fromString', assert => {
  assert.isFunction(fromString);
  assert.name(fromString, 'fromString');
  assert.arity(fromString, 2);
  assert.throws(() => fromString(undefined), TypeError, 'The first argument should be a string #1');
  assert.throws(() => fromString(Object('10')), TypeError, 'The first argument should be a string #1');
  assert.throws(() => fromString(''), SyntaxError, 'Empty string');
  assert.same(fromString('-10', 2), -2, 'Works with negative numbers');
  assert.throws(() => fromString('-'), SyntaxError, '-');
  assert.same(fromString('10'), 10, 'Default radix is 10 #1');
  assert.same(fromString('10', undefined), 10, 'Default radix is 10 #2');
  for (let radix = 2; radix <= 36; ++radix) {
    assert.same(fromString('10', radix), radix, `Radix ${ radix }`);
  }
  assert.throws(() => fromString('10', -4294967294), RangeError, 'Radix uses ToInteger #1');
  assert.same(fromString('10', 2.5), 2, 'Radix uses ToInteger #2');
  assert.same(fromString('42'), 42);
  assert.same(fromString('42', 10), 42);
  assert.throws(() => fromString('0xc0ffee'), SyntaxError);
  assert.throws(() => fromString('0o755'), SyntaxError);
  assert.throws(() => fromString('0b00101010'), SyntaxError);
  assert.throws(() => fromString('C0FFEE', 16), SyntaxError);
  assert.same(fromString('c0ffee', 16), 12648430);
  assert.same(fromString('755', 8), 493);
  assert.throws(() => fromString(''), SyntaxError);
  assert.throws(() => fromString(' '), SyntaxError);
  assert.throws(() => fromString(' 1'), SyntaxError);
  assert.throws(() => fromString(' \n '), SyntaxError);
  assert.throws(() => fromString('x'), SyntaxError);
  assert.throws(() => fromString('1234', 0), RangeError);
  assert.throws(() => fromString('1234', 1), RangeError);
  assert.throws(() => fromString('1234', 37), RangeError);
  assert.throws(() => fromString('010'), SyntaxError);
  assert.throws(() => fromString('1_000_000_000'), SyntaxError);
});
