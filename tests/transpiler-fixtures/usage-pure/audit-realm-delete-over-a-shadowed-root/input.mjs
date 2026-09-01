// a LOCAL binding wearing a realm name holds the user's own object, and a `delete` through it acts
// on that object: substituting the ponyfill there deletes off core-js instead. the spine walks the
// run's root itself, so it owes the same binding question detection asks of every claim - and the
// answer is position-aware (the case-direct discriminant canon), not "a binding of that name exists"
let e = 0;
export function viaParam(globalThis) { return delete globalThis.self.customProp; }
export function viaHopName(self) { return delete self.window.customProp; }
export function viaLexical() { const globalThis = { self: {} }; return delete globalThis.self.customProp; }
export function viaCatch() { try { e++; } catch (globalThis) { return delete globalThis.self.customProp; } }
export function viaNested(globalThis) { return () => delete globalThis.self.customProp; }
export function viaRead(globalThis) { return globalThis.self.customProp; }

// NEGATIVE: the same shapes off the REAL realm still fold - the shadow is what stops the collapse,
// not the spelling
export const realDelete = delete globalThis.self.customProp;
export { e };
