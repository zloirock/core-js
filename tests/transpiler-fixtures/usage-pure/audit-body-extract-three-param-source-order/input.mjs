// Exported parameters keep caller-supplied properties; body extraction cannot prove a default.
// Promise has a constructor entry, so its rest-bearing default uses the full index.
function f({ from, ...r1 } = Array, { keys, ...r2 } = Object, { resolve, ...r3 } = Promise) {
  return [from([1]), keys({}), resolve(0), r1, r2, r3];
}
export { f };
