// An excluded hop above a stored probe remains observable to every reader.
// Its getter and throw precede calls; the outer optional cannot erase that read.
let held;
consume((held = globalThis.window).self.slot);
(held = globalThis.window).self.touch(arg());
consume((held = globalThis.window).self?.slot);
consume((held = globalThis.window)?.self.slot);
consume(((held = globalThis.window)?.self).slot);
delete (held = globalThis.window).self.slot;
export { held };
