// A realm key's level nested in a parameter's pattern reads its slot through the parameter's default, as a
// declaration's reads it through the init: the parameter's default mirrors the constructor's statics, its whole
// index under a rest. A default nested in the pattern is the level's, not the parameter's: `Set.groupBy` is not
// what is read, and the level keeps its own default - a caller's object may lack the slot - save where the one
// caller hands the realm itself (`viaArgument`), whose slot is filled: the dead default leaves with the mirror.
export function group({ Map: { groupBy } = Set } = globalThis) {
  return groupBy;
}
export const attempt = ({ Promise: { try: run } = WeakMap } = self) => run;
export class Pending {
  static make({ Promise: { withResolvers } = Iterator } = globalThis) {
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
export function gathered({ Promise: { all, ...others } = URL } = globalThis) {
  return [all, others];
}
export function wrapped([{ Promise: { resolve } = Symbol }] = [globalThis]) {
  return resolve;
}
