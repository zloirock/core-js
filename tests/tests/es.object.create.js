import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('Object.create', assert => {
  const { create, getPrototypeOf, getOwnPropertyNames } = Object;
  function getPropertyNames(object) {
    let result = [];
    do {
      result = result.concat(getOwnPropertyNames(object));
    } while (object = getPrototypeOf(object));
    return result;
  }
  assert.isFunction(create);
  assert.arity(create, 2);
  assert.name(create, 'create');
  assert.looksNative(create);
  assert.nonEnumerable(Object, 'create');
  let object = { q: 1 };
  assert.ok({}.isPrototypeOf.call(object, create(object)));
  assert.ok(create(object).q === 1);
  function F() {
    return this.a = 1;
  }
  assert.ok(create(new F()) instanceof F);
  assert.ok(F.prototype === getPrototypeOf(getPrototypeOf(create(new F()))));
  assert.ok(create(new F()).a === 1);
  assert.ok(create({}, { a: { value: 42 } }).a === 42);
  object = create(null, { w: { value: 2 } });
  assert.same(object, Object(object));
  assert.ok(!('toString' in object));
  assert.ok(object.w === 2);
  assert.deepEqual(getPropertyNames(create(null)), []);
});

QUnit.test('Object.create.sham flag', assert => {
  assert.same(Object.create.sham, DESCRIPTORS ? undefined : true);
});
