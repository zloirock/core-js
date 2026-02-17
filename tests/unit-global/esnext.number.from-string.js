QUnit.test('Number.fromString', assert => {
  const { fromString } = Number;
  assert.isFunction(fromString);
  assert.name(fromString, 'fromString');
  assert.arity(fromString, 2);
  assert.looksNative(fromString);
  assert.nonEnumerable(Number, 'fromString');
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
  assert.same(fromString('3.14159', 10), 3.14159);
  assert.same(fromString('-100.11', 2), -4.75);
  assert.same(fromString('202.1', 3), 20.333333333333332);

  assert.same(fromString('0'), 0);
  assert.same(fromString('0', 2), 0);
  assert.same(fromString('-0'), -0);
  assert.same(fromString('-0', 2), -0);

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

  assert.same(fromString('1.0'), 1, 'trailing fractional zero');
  assert.same(fromString('1.00'), 1, 'trailing fractional zeros');
  assert.same(fromString('1.10'), 1.1, 'trailing fractional zero after non-zero');
  assert.same(fromString('0.0'), 0, 'zero with trailing fractional zero');
  assert.same(fromString('-1.0'), -1, 'negative with trailing fractional zero');

  assert.throws(() => fromString('19', 8), SyntaxError, 'Invalid digit for radix #1');
  assert.throws(() => fromString('1g', 16), SyntaxError, 'Invalid digit for radix #2');
  assert.throws(() => fromString('fg', 16), SyntaxError, 'Invalid digit for radix #3');
  assert.throws(() => fromString('89', 8), SyntaxError, 'Invalid digit for radix #4');
  assert.throws(() => fromString('1.2.3', 16), SyntaxError, 'Multiple dots #1');
  assert.throws(() => fromString('1.2.3', 10), SyntaxError, 'Multiple dots #2');
  assert.throws(() => fromString('.5', 16), SyntaxError, 'Leading dot #1');
  assert.throws(() => fromString('5.', 16), SyntaxError, 'Trailing dot #1');
  assert.throws(() => fromString('.5', 10), SyntaxError, 'Leading dot #2');
  assert.throws(() => fromString('5.', 10), SyntaxError, 'Trailing dot #2');
});
