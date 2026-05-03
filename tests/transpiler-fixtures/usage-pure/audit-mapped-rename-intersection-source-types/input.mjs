// expandMappedTypeMembers source-side intersection: `keyof (A & B)` enumerates
// keys from both. Helper must descend through getTypeMembers on the intersection
// node and produce a member set that mixes A and B keys. Capitalize rename should
// apply uniformly. Stresses interaction between intersection-aware getTypeMembers
// and the rename-template intrinsic transformer.
type A = { items: number[] };
type B = { name: string };
type Pickled<T> = { [K in keyof T as Capitalize<K & string>]: T[K] };
declare const r: Pickled<A & B>;
r.Items.at(0);
r.Name.includes('a');
