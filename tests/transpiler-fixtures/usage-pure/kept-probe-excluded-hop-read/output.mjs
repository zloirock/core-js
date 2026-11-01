import _globalThis from "@core-js/pure/actual/global-this";
// An excluded hop above a stored probe remains observable to every reader.
// Its getter and throw precede calls; the outer optional cannot erase that read.
let held;
consume((held = _globalThis.window).self.slot);
(held = _globalThis.window).self.touch(arg());
consume((held = _globalThis.window).self?.slot);
consume((held = _globalThis.window)?.self.slot);
consume(((held = _globalThis.window)?.self).slot);
delete (held = _globalThis.window).self.slot;
export { held };