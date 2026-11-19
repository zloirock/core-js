// Realm hops repeated past the environment probe hide nothing from usage detection: the realm global
// and the static each navigation reaches pull their modules, whatever spells the root - an alias, a
// call, a sequence, a kept write - and under a `delete` alike.
const g = globalThis;
const f = () => globalThis;
let e = 0;
let held;
export const direct = globalThis.window?.window?.self.Array.from;
export const viaSelf = self.window?.window?.window?.self.Math.trunc;
export const viaAlias = g.window?.window?.self.Object.entries;
export const viaCall = f().window?.window?.self.Number.isInteger;
export const viaSequence = (e++, globalThis.window)?.window?.self.String.raw;
export const stored = (held = globalThis.window?.window)?.self.Array.of(1);
export const removed = delete globalThis.self?.window?.window?.self.Reflect.slot;
