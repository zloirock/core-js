// The closed true selector gives both defaults their direct Array arm; the deep proxy alternate stays
// only as the native fallback spelling. Two live deep proxy arms remain covered by
// `audit-per-branch-synth-deep-proxy-chain`.
const cond = true;
function f({ from } = cond ? Array : globalThis.self.Array) {
  return from([1]);
}
function g({ of } = cond ? Array : globalThis.self.Array) {
  return of(2, 3);
}
export { f, g };
