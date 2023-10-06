import getPrototypeOf from 'core-js-pure/es/object/get-prototype-of';
import getOwnPropertyNames from 'core-js-pure/es/object/get-own-property-names';
import create from 'core-js-pure/es/object/create';

QUnit.test('Object.create', assert => {
  function getPropertyNames(object) {
    let result = [];
    do {
      result = result.concat(getOwnPropertyNames(object));
    } while (object = getPrototypeOf(object));
    return result;
  }
  assert.isFunction(create);
  assert.arity(create, 2);
  let object = { q: 1 };
  assert.true({}.isPrototypeOf.call(object, create(object)));
  assert.same(create(object).q, 1);
  function C() {
    return this.a = 1;
  }
  assert.true(create(new C()) instanceof C);
  assert.same(C.prototype, getPrototypeOf(getPrototypeOf(create(new C()))));
  assert.same(create(new C()).a, 1);
  assert.same(create({}, { a: { value: 42 } }).a, 42);
  object = create(null, { w: { value: 2 } });
  assert.same(object, Object(object));
  assert.false('toString' in object);
  assert.same(object.w, 2);
  assert.deepEqual(getPropertyNames(create(null)), []);
});
