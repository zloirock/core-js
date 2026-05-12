// Array pattern nested over an array of objects: `[{ a }] = data` where
// `data: { a: number[] }[]` should narrow `a` to `number[]` via the element type
// and the property lookup. Exercises the [index, key] composed keyPath through
// the shared `resolveDestructuredMember` fallback.
declare const data: { a: number[] }[];
let a;
[{ a }] = data;
a.includes(0);
