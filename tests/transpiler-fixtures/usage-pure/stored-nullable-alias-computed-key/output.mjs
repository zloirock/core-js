import _globalThis from "@core-js/pure/actual/global-this";
// The nullable alias is read before a computed key runs.
const held = _globalThis.window;
let saved;
(saved = held).self[effect(), 'Array'];