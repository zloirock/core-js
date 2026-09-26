// A for-x HEAD declares no slot and hosts no statement, so the anchor the declarator and the
// assignment hosts take has nowhere to land: what the head's pattern reads is an ELEMENT of the
// iterated literal, and the MIRROR swaps that element in place - the polyfill then wins on every
// pass, where the source's own read is native and undefined off-engine. Spelled off the bare realm,
// off a CALL the inline canon proves to yield it (the call stays, ahead of the literal, so it still
// runs exactly once per pass), through an ARRAY wrapper, and with a claiming leaf beside the
// pattern. A `for await` head keeps the source on both legs - the awaited value is not the node the
// literal spells - and so does a head over a value no literal pairs.
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
