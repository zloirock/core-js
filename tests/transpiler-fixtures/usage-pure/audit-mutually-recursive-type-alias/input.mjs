// mutually-recursive type aliases — resolution bails on cycle
type A = B;
type B = A;
declare const x: A;
const r = (x as any).at(0);
globalThis.__r = r;
