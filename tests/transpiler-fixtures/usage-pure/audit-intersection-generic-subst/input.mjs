// intersection wrapping a generic: `X<T> = Holder<T[]> & { ... }` - outer type-param
// flows through the intersection branch to `Holder`, so `x.data.at(0)` resolves as Array.at
type Holder<T> = { data: T };
type X<T> = Holder<T[]> & { meta: string };
declare const x: X<number>;
globalThis.__r = x.data.at(0);
