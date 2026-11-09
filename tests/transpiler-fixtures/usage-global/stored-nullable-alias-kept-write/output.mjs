import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A consumed assignment cannot replace the throwing alias read with a defined realm.
const held = globalThis.window;
let first, second;
export const value = first = second = held.self;