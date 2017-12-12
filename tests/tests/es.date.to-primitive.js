import { STRICT } from '../helpers/constants';

QUnit.test('Date#@@toPrimitive', assert => {
  const toPrimitive = Date.prototype[Symbol.toPrimitive];
  assert.isFunction(toPrimitive);
  assert.arity(toPrimitive, 1);
  assert.nonEnumerable(Date.prototype, Symbol.toPrimitive);
  const date = new Date();
  assert.same(date[Symbol.toPrimitive]('string'), date.toString(), 'generic, hint "string"');
  assert.same(date[Symbol.toPrimitive]('number'), +date, 'generic, hint "number"');
  assert.same(date[Symbol.toPrimitive]('default'), date.toString(), 'generic, hint "default"');
  assert.same(toPrimitive.call(Object(2), 'string'), '2', 'generic, hint "string"');
  assert.same(toPrimitive.call(Object(2), 'number'), 2, 'generic, hint "number"');
  assert.same(toPrimitive.call(Object(2), 'default'), '2', 'generic, hint "default"');
  let data = [undefined, '', 'foo', { toString() { return 'string'; } }];
  for (const value of data) {
    assert.throws(() => new Date()[Symbol.toPrimitive](value), TypeError, `throws on ${ value } as a hint`);
  }
  if (STRICT) {
    data = [1, false, 'string', null, undefined];
    for (const value of data) {
      assert.throws(() => toPrimitive.call(value, 'string'), TypeError, `throws on ${ value } as \`this\``);
    }
  }
});
