// Both reads store a plain navigation ending at backed self. Its value is the
// realm object, so the optional over the second store is dead as well. Each
// sequence prefix still runs once before the stored value is consumed.
let c = 0;
let plain;
let probed;
export const value = (plain = (c++, globalThis.window.self)).Array.prototype.at;
export const guarded = (probed = (c++, globalThis.window.self))?.Number.MAX_SAFE_INTEGER;
