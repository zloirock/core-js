// `Box<T> = { [K in keyof T]: T[K] | null }` substitutes per-key with a nullable union.
// Optional-chain `?.at(0)` peels the null arm so the array narrow on `b.a` survives.
type Box<T> = { [K in keyof T]: T[K] | null };
declare const b: Box<{ a: string[] }>;
b.a?.at(0);
