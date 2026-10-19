// mutually-recursive type aliases - resolution bails on cycle
// @ts-expect-error a cyclic type tsc refuses is the shape under test
type A = B;
// @ts-expect-error a cyclic type tsc refuses is the shape under test
type B = A;
declare const x: A;
const r = (x as any).at(0);
globalThis.__r = r;
