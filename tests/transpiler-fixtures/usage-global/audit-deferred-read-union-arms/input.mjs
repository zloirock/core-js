// which arms of the reachable-value union behind a DEFERRED read can be read, and which leave the
// set open. a write through a BINDING reference is readable: the reference resolves in the scope
// that encloses the write, so a plain alias and a shadowed `undefined` - an ordinary local value,
// not the global sentinel - both name their family. an unshadowable nullish arm (`null`, `void`)
// dispatches nothing and drops out, which lets the remaining write narrow alone. what stays open is
// a value with no single node to read: a destructuring write binds a SLOT of its right-hand side
// rather than the whole value, and a call result is unknown. distinct method per line so each row is
// attributable: typeless keeps every variant of a multi-prototype method, a narrowed receiver its own
let opaqueSlot = null;
const readSlot = () => opaqueSlot.at(0);
[opaqueSlot] = [source()];
export const a = readSlot();
let shadowedUndefined = null;
const readShadowed = () => shadowedUndefined.includes(1);
{
  let undefined = [1];
  shadowedUndefined = undefined;
}
export const b = readShadowed();
let voidWrite = [1];
const readVoid = () => voidWrite.flatMap(f);
voidWrite = void 0;
export const c = readVoid();
let aliasWrite = null;
const readAlias = () => aliasWrite.entries();
const arraySource = ["a"];
aliasWrite = arraySource;
export const d = readAlias();
let callResult = null;
const readCall = () => callResult.keys();
callResult = source();
export const e = readCall();
