// Receiver prefixes retain live polyfill rewrites under bodyless and assignment hosts.
// Each observable call runs once at its original evaluation point.
const arr = [1, [2]];
function mk() { return globalThis; }
export function bodylessLiftedPrefix() {
  if (1) var { Map: { groupBy } } = (arr.flat(), globalThis);
  return typeof groupBy;
}
export function bodylessLiftedPrefixWhile() {
  do var { Object: { entries } } = (arr.flat(), globalThis); while (0);
  return typeof entries;
}
export function assignOverQuietCallRoot() {
  let of;
  ({ of } = mk().Array);
  return typeof of;
}
export function assignOverEffectfulCallRoot() {
  let from;
  ({ from } = mk().Array);
  return typeof from;
}
