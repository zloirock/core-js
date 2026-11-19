// `keyof (A & B)` source-side intersection mixes keys from both branches under one rename.
// `Capitalize` rename must apply uniformly so per-field narrows survive across the intersection.
type A = { items: number[] };
type B = { name: string };
type Pickled<T> = { [K in keyof T as Capitalize<K & string>]: T[K] };
declare const r: Pickled<A & B>;
r.Items.at(0);
r.Name.includes('a');
