// discriminated union narrow on a generic alias: `Foo<string>` with `if (x.kind === 'a')`
// should narrow to the `{ kind: 'a'; val: T[] }` branch AND carry the T=string substitution
// through so `val` resolves to `string[]` and dispatches the Array-specific instance.at
type Foo<T> = { kind: 'a'; val: T[] } | { kind: 'b'; val: T };
declare const x: Foo<string>;
if (x.kind === 'a') x.val.at(0);
