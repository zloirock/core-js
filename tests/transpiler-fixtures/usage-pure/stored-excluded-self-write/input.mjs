// A stored excluded realm slot stays the base of the later write.
// Its read and failure precede the right-hand side.
let held; (held = globalThis.self).window.slot = effect();
