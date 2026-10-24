// a `?.` realm hop reading a SEALED probe run re-tests exactly the value the seal holds, so the run
// goes on through the seal and a `delete` over it takes the guard whole, whatever roots the run.
// a key that is no realm hop reads the sealed value instead and keeps it guarded inside the seal,
// and a plain read past the seal is the source's own throw, a `?.` further on included
let w;
const g = globalThis;
export const windowTail = delete (globalThis.window?.self)?.window.windowSlot;
export const selfTail = delete (globalThis.window?.self)?.self.selfSlot;
export const optionalAfterTail = delete (globalThis.window?.self)?.window?.optionalSlot;
export const aliasRoot = delete (g.window?.self)?.window.aliasSlot;
export const callRoot = delete ((() => globalThis)().window?.self)?.window.callSlot;
export const storeRoot = delete ((w = globalThis.window)?.self)?.window.storeSlot;
export const plainKey = delete (globalThis.window?.self)?.plainKeySlot;
export const plainRead = delete (globalThis.window?.self).self.plainReadSlot;
export const plainReadOptionalOn = delete (globalThis.window?.self).window?.Array.of(1).optionalOnSlot;
