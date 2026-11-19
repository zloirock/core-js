// Loop heads reading properties of a served static keep that static as their receiver.
// Direct, call-produced and array-wrapped hosts preserve their native residual boundaries.
let arity, viaCall, wrapped, beside, besideName, awaited, opaque;
const log = [];
function realm() {
  log.push('r');
  return globalThis;
}
for (const { Array: { of: { length: seen } } } of [globalThis]) arity = seen;
for (const { Array: { of: { length: seen } } } of [realm()]) viaCall = seen;
for (const [{ Array: { of: { length: seen } } }] of [[globalThis]]) wrapped = seen;
for (const { Array: { of: { length: seen }, from } } of [globalThis]) {
  beside = seen;
  besideName = from;
}
for (const { Array: { of: { length: seen } } } of [{ Array: { of: { length: 7 } } }]) opaque = seen;
export async function readAwaited() {
  for await (const { Array: { of: { length: seen } } } of [globalThis]) awaited = seen;
  return awaited;
}
export { arity, viaCall, wrapped, beside, besideName, opaque, log };
