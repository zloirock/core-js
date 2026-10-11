// a realm hop read directly above a hop claim seals the claim off only while its slot holds the
// user's object: read BEFORE the file writes that slot it is still the realm, and the run folds like
// its write-free twin across the paren or the cast written below it
export const parenRead = (globalThis.window).self.window.parenSlot;
export const castRead = (globalThis.window as any).self.window.castSlot;
delete globalThis.window;
