// Identity mapped type `{ [K in keyof T]: T[K] }` written inline in annotation, not via an alias.
// Passthrough must unwrap to the source type so `data: number[]` keeps its array shape.
declare const x: { [K in keyof { data: number[] }]: { data: number[] }[K] };
x.data.at(0);
