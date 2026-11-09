// A cloned receiver keeps type-only patterns and the runtime fields of parameter properties.
QUnit.test('cloned receiver: signature parameters survive printing and lowering', assert => {
  const handlers = [(value: number) => value + 1];
  const last = (handlers as Array<(...values: number[]) => number>).at(-1);
  assert.same(last!(2), 3);
  const make = ([a, b]: number[]) => [a, b];
  assert.same((make as ([a, b]: number[]) => number[])([3, 4]).at(-1), 4);
  const object = ({ value }: { value: number }) => [value];
  assert.same((object as ({ value }: { value: number }) => number[])({ value: 5 }).at(0), 5);
});

QUnit.test('cloned receiver: defaulted parameter properties keep fields and rewritten defaults', assert => {
  const effects: string[] = [];
  const last = new (class {
    constructor(public readonly value: number[] = (effects.push('default'), Array.from([1, 2]))) {}
  })().value.at(-1);
  assert.same(last, 2);
  assert.deepEqual(effects, ['default']);
});
