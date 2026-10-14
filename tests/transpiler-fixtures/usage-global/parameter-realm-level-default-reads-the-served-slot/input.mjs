// A realm key's level nested in a parameter's pattern reads its slot through the parameter's default, as a
// declaration's reads it through the init, whatever hosts the parameter and beside a rest alike. The level's own
// default stays live, since a caller's object may lack the slot, and loads what it reads (`grouped({})` reads
// `Object.groupBy`), save where the one caller hands the realm itself (`viaArgument`): that default is dead.
export function zipped({ Iterator: { zip } = Set } = globalThis) {
  return zip;
}
export function grouped({ Map: { groupBy } = Object } = globalThis) {
  return groupBy;
}
export const attempt = ({ Promise: { try: run } = WeakMap } = self) => run;
export class Pending {
  static make({ Promise: { withResolvers } = Number } = globalThis) {
    return withResolvers;
  }
}
const realm = globalThis;
export function settle({ Promise: { allSettled, race } = WeakSet } = realm) {
  return [allSettled, race];
}
export function nested({ self: { Promise: { any } = DOMException } } = globalThis) {
  return any;
}
export const viaArgument = (function ({ Promise: { reject } = Reflect }) {
  return reject;
})(globalThis);
export function gathered({ URL: { canParse, ...others } = SuppressedError } = globalThis) {
  return [canParse, others];
}
export function wrapped([{ Promise: { all } = Error }] = [globalThis]) {
  return all;
}
