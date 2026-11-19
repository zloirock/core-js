// A receiver invoker is a call of the function it invokes: the parameter holds the argument the
// pairing places there, and a static read off it resolves like one off the argument itself.
QUnit.test('receiver invokers: a parameter static read resolves through every invoker spelling', assert => {
  function viaCall(a) { return a.of(1); }
  function viaApply(o) { return o.groupBy([1, 2], v => v % 2); }
  function viaReflect(m) { return m.groupBy([1, 2], v => v % 2); }
  function viaBind(p) { return p.withResolvers(); }
  assert.deepEqual(viaCall.call(null, Array), [1]);
  assert.deepEqual(viaApply.apply(null, [Object])[1], [1]);
  assert.deepEqual(Reflect.apply(viaReflect, null, [Map]).get(0), [2]);
  assert.same(typeof viaBind.bind(null, Promise)().resolve, 'function');
});

QUnit.test('receiver invokers: a plain call site beside an invoker site keeps both narrow', assert => {
  function read(a) { return a.of(2); }
  assert.deepEqual(read(Array), [2]);
  assert.deepEqual(read.call(null, Array), [2]);
});
