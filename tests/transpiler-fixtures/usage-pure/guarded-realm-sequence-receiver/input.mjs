// A guarded realm read through a sequence prefix names the same receiver as the bare alias: the
// prefix runs once ahead of the identity test, the constructor takes its family entry (its statics
// are read through it), and a static under the constructor gets the captured-receiver guard.
export function readSymbol(flag) {
  if (flag) { var realm = globalThis; }
  return (log.push('r'), realm).Symbol.iterator;
}
export function readStatic(flag) {
  if (flag) { var realm = globalThis; }
  return (log.push('r'), realm).Map.groupBy;
}
export function callStatic(flag) {
  if (flag) { var realm = globalThis; }
  return (log.push('r'), realm).Array.of(7);
}
export function pureSymbol(flag) {
  if (flag) { var realm = globalThis; }
  return (0, realm).Symbol.iterator;
}
// A constructor read off the guarded realm and STORED whole is read through its binding, so the
// entry carries the statics itself.
export function heldStatic(flag) {
  if (flag) { var realm = globalThis; }
  const held = realm.Map;
  return held.groupBy;
}
