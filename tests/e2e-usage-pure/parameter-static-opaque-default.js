// Opaque supplied arguments retain native leaves when the argument mirror declines.
const nativeOf = Object.getOwnPropertyDescriptor(Array, 'of')?.value;

QUnit.test('parameter static: known caller beside an opaque default', assert => {
  function outer(Array) {
    function read([{ of } = Array], value) { return of(value); }
    return [read([globalThis.Array], 1), read([undefined], 2)];
  }
  assert.deepEqual(outer({ of: value => ['custom', value] }), [[1], ['custom', 2]]);
});

QUnit.test('parameter static: a supplied receiver beside a different known default', assert => {
  function read([{ groupBy } = Object]) { return groupBy([1], value => value); }
  assert.deepEqual(read([Map]).get(1), [1]);
  assert.deepEqual(read([undefined])[1], [1]);
});

QUnit.test('parameter static: effectful caller beside an opaque default', assert => {
  const effects = [];
  function outer(Custom) {
    // eslint-disable-next-line default-param-last -- the later argument must run before the supplied static is extracted
    function read({ of } = Custom, later) {
      effects.push('body', later);
      return of(1);
    }
    return [read((effects.push('argument'), globalThis.Array), (effects.push('later'), 2)), read(undefined, 3)];
  }
  assert.deepEqual(outer({ of: value => ['custom', value] }), [[1], ['custom', 1]]);
  assert.deepEqual(effects, ['argument', 'later', 'body', 2, 'body', 3]);
});

QUnit.test('parameter static: caller selections and opaque calls preserve effects', assert => {
  const effects = [];
  function make() {
    effects.push('make');
    return Array;
  }
  const pick = 1;
  function fromCall({ of }) {
    effects.push('call-host');
    return of;
  }
  function fromSelection({ from }) {
    effects.push('selection-host');
    return from;
  }
  const supplied = fromCall(make());
  // The single pass retains this opaque call; post-lowering can serve its plain member read.
  if (supplied === undefined) assert.same(supplied, nativeOf);
  else assert.deepEqual(supplied(2), [2]);
  assert.deepEqual(fromSelection(pick ? Array : Array)([3]), [3]);
  // Both argument routes evaluate once before entering their function body.
  assert.deepEqual(effects, ['make', 'call-host', 'selection-host']);
});

QUnit.test('parameter static: an argument naming no static keeps the parameter raw', assert => {
  function read({ of }) { return of; }
  function own(value) { return ['own', value]; }
  assert.strictEqual(read({ of: own }), own);
  // a leaf default here would answer where the source hands back `undefined`
  assert.strictEqual(read({}), undefined);
});

QUnit.test('parameter static: member arguments and local method aliases', assert => {
  const input = { held: Array };
  function read({ of }) { return of; }
  const methods = { read({ from }) { return from([2]); } };
  const alias = methods.read;
  assert.deepEqual(read(input.held)(1), [1]);
  assert.deepEqual(methods.read(Array), [2]);
  assert.deepEqual(alias(Array), [2]);
});

QUnit.test('parameter static: nested agreeing selections preserve the selected argument', assert => {
  const effects = [];
  const pick = true;
  function read({ held: { of } }) { return of; }
  assert.same(read(pick ? { held: (effects.push('yes'), Array) } : { held: (effects.push('no'), Array) }), nativeOf);
  assert.deepEqual(effects, ['yes']);
});
