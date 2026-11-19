// The plain read after storing a nullable alias must throw before the later optional hop.
const held = globalThis.window;
let saved;
(saved = held).self?.box;
