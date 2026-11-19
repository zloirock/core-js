import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A stored realm remains observable while its proxy hops collapse in pure mode.
// The write owns its source comment; rereading the held receiver must not repeat it.
let held;
(held /* saved realm */ = globalThis.window).self.Map = 2;
export { held };