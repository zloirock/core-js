import _globalThis from "@core-js/pure/actual/global-this";
// The plain read after storing a nullable alias must throw before the later optional hop.
const held = _globalThis.window;
let saved;
(saved = held).self?.box;