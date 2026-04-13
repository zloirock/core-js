// Tests for polyfills with filters: arg-is-object, min-args

// filter: arg-is-object - polyfill needed for non-object args (ES2015 coercion)
QUnit.test('filter/arg-is-object: Object.keys with string arg', assert => {
  // string argument - polyfill coerces to object
  assert.deepEqual(Object.keys('abc'), ['0', '1', '2']);
});

QUnit.test('filter/arg-is-object: Object.freeze', assert => {
  const obj = Object.freeze({ a: 1 });
  assert.throws(() => { obj.a = 2; }, TypeError);
});

QUnit.test('filter/arg-is-object: Object.getPrototypeOf', assert => {
  assert.same(Object.getPrototypeOf(1), Number.prototype);
});

// filter: min-args - polyfill only when called with enough arguments
QUnit.test('filter/min-args: JSON.parse with reviver', assert => {
  const result = JSON.parse('{"a":1,"b":2}', (key, value) => {
    return typeof value === 'number' ? value * 2 : value;
  });
  assert.same(result.a, 2);
  assert.same(result.b, 4);
});

// filter: min-args on instance - Number#toFixed with arg
QUnit.test('filter/min-args: Number#toFixed(n)', assert => {
  assert.same(1.005.toFixed(2), '1.00');
});

// filter not triggered - skips polyfill when args don't match
QUnit.test('filter: Object.keys with object arg (no polyfill needed)', assert => {
  assert.deepEqual(Object.keys({ x: 1, y: 2 }), ['x', 'y']);
});
