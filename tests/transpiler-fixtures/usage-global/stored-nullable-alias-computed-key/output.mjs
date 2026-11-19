import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// The nullable alias is read before a computed key runs.
const held = globalThis.window;
let saved;
(saved = held).self[effect(), 'Array'];