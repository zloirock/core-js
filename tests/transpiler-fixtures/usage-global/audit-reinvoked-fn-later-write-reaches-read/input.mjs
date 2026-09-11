// usage-global guard: the reach test is gated to usage-pure by its own method check, so the
// over-inject-safe side must keep injecting for every cell whatever the pure side decides
let M = globalThis.Map;
let R = globalThis.Reflect;
let P = globalThis.Promise;
let N = globalThis.Number;
export function sameFn() {
  const g = M.groupBy;
  M = Set;
  return g;
}
export function nestedWrite() {
  const { ownKeys: o } = R;
  if (o) { R = Math; }
  return o;
}
// straight-line module scope: the entry happens once, so the write after the read cannot precede it
const settled = P.allSettled;
P = Set;
export { settled };
// no write at all - the init is trivially live
export const integer = N.isInteger;
