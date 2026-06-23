// An instance method reached through a proxy-hop static receiver (`globalThis.self.Array.prototype.slice`):
// the unplugin instance dispatch must collapse the receiver's proxy hop to the pure root
// (`_globalThis.Array.prototype`), NOT strand a raw `globalThis.self.Array.prototype` whose `.self` hop is
// undefined off-engine (ie:11 ReferenceError / Node). covers a dotted receiver, a `.call` form, and a
// multi-hop receiver. distinct instance methods so each line's helper import is unambiguous.
const sliced = globalThis.self.Array.prototype.slice.call([1, 2, 3], 1);
const found = globalThis.self.Array.prototype.indexOf.call([1, 2, 3], 2);
const flat = globalThis.self.window.Array.prototype.flat.call([[1]]);
export { sliced, found, flat };