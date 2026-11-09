import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// The optional link guards the value just stored, including a backed hop above it.
const held = globalThis.window;
let saved;
(saved = held)?.self.Array.isArray([]);