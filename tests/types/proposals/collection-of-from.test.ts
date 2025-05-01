const rm: Map<number, []> = Map.from([[1, 'a'], [2, 'b']]);
const rm2: Map<number, number> = Map.from([[1, 10], [2, 20]], (v: number, k: number) => v + k);
Map.from([[1, 10], [2, 20]], function (this: { n: number }, v: number) { return v + this.n; }, { n: 2 });
// @ts-expect-error
Map.from([['a', 1], ['b', 2]], (v: string, k: number) => v);
// @ts-expect-error
Map.from([1, 2]);
// @ts-expect-error
Map.from();

Map.of(['a', 1], ['b', 2]);
const rm4: Map<string, number> = Map.of(['a', 1], ['b', 2]);
// @ts-expect-error
Map.of([1, 2, 3]);
// @ts-expect-error
Map.of(1, 2);

const rs1: Set<number> = Set.from([1, 2, 3]);
const rs2: Set<string> = Set.from([1, 2, 3], x => x.toString());
const rs3: Set<[string, number]> = Set.from([['a', 1], ['b', 2]]);
Set.from(['a', 'b'], function (this: { s: string }, value: string) { return value + this.s; }, { s: '-' });
// @ts-expect-error
Set.from([1, 2, 3], (v: string) => v);
// @ts-expect-error
Set.from();

const rso1: Set<number> = Set.of(1, 2, 3);
const rso2: Set<string> = Set.of('a', 'b', 'c');
// @ts-expect-error
Set.of({ 'foo': 'bar' }, 2);

const rwm1: WeakMap<{ a: number }, string> = WeakMap.from([[{ a: 1 }, 'x']]);
const rwm2: WeakMap<object, string> = WeakMap.from([[{}, 1], [{}, 2]], (v, k) => v.toString());
WeakMap.from([[{}, 1], [{}, 2]], function (this: { s: string }, v: number) { return this.s + v; }, { s: '-' });
// @ts-expect-error
WeakMap.from([[1, 2], [2, 3]]);
// @ts-expect-error
WeakMap.from([[{}, 1], [{}, 2]], (v: string, k: string) => v);
// @ts-expect-error
WeakMap.from([1, 2]);
// @ts-expect-error
WeakMap.from();

const rwmo1: WeakMap<object, number> = WeakMap.of([{}, 2]);
// @ts-expect-error
WeakMap.of([1, 2]);
// @ts-expect-error
WeakMap.of({});

const rws1: WeakSet<object> = WeakSet.from([{}]);
const rws2: WeakSet<object> = WeakSet.from([{}, {}], x => x);
WeakSet.from([{}], function (this: { s: string }, obj: object) { return obj; }, { s: '-' });
// @ts-expect-error
WeakSet.from([1, 2]);
// @ts-expect-error
WeakSet.from([{}], (v: number) => v);
// @ts-expect-error
WeakSet.from();
// @ts-expect-error
WeakSet.from([{}], x => 'not-an-object');

const rwso1: WeakSet<object> = WeakSet.of({});
// @ts-expect-error
WeakSet.of(1);
