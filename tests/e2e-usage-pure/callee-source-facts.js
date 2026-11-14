QUnit.test('local methods keep their static results inside instance call arguments', assert => {
  const events = [];
  const out = [];
  const factory = { make() {
    events.push('callee');
    return Array;
  } };
  out.push(factory.make().from((events.push('argument'), [3])));
  assert.deepEqual(out, [[3]]);
  assert.deepEqual(events, ['callee', 'argument']);
  assert.deepEqual([4, 5].map(value => factory.make().from([value])), [[4], [5]]);
  out.push((C => C.from([6]))(Array));
  assert.deepEqual(out, [[3], [6]]);
  out.push((P => P.allSettled)(Promise));
  assert.same(typeof out[2], 'function');
});

QUnit.test('private static callees retain their result and parameter sources', assert => {
  const events = [];
  class Factory {
    static #make() { events.push('callee'); return Promise; }
    static '#make'() { return { withResolvers: 17 }; }
    static #read(P) { return typeof P.allSettled; }
    static #from(C) { return C.from([7]); }
    static run() {
      return [typeof Factory.#make().withResolvers, Factory['#make']().withResolvers, Factory.#read(Promise), Factory.#from(Array)];
    }
  }
  assert.deepEqual(Factory.run(), ['function', 17, 'function', [7]]);
  assert.deepEqual(events, ['callee']);
});
