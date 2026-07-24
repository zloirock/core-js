// KNOWN LIMITATION (deferred): a receiver whose prototype is installed via an object-literal
// `__proto__:` (`{ __proto__: Array.prototype }`) inherits polyfilled instance methods, so on an
// engine lacking them the member access needs the polyfill - but usage-global currently classifies
// the object literal as a known non-instance type and injects nothing, so the member reads throw off
// target. the intended fix is to treat a custom-`__proto__` object literal as an UNKNOWN-type
// receiver so the typeless instance union injects (over-inject-safe); too specific to prioritise now.
// this fixture locks the CURRENT (no-injection) behaviour and updates when the fix lands. distinct
// method per line
let arr = { __proto__: Array.prototype };
export const a = arr.at(-1);
let str = { __proto__: String.prototype };
export const b = str.padStart(3);
