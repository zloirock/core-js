// A realm-level default serves only the slot that actually selects it.
// Direct defaults keep their ponyfills; a retained array wrapper preserves
// the foreign Symbol default when a caller supplies a missing Promise slot.
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
