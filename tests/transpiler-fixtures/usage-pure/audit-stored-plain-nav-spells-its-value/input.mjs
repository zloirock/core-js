// a PLAIN navigation the source stores: nothing above the store observes its absence, so the slot
// takes the navigation's own value - that nav IS the realm - and not the probe guard. the read
// through a live `?.` is the negative half: there the store's absence IS observed, and the guard
// stays for both emitters
let c = 0;
let plain;
let probed;
export const value = (plain = (c++, globalThis.window.self)).Array.prototype.at;
export const guarded = (probed = (c++, globalThis.window.self))?.Number.MAX_SAFE_INTEGER;
