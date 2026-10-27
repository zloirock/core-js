import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// An alias assigned after declaration keeps its optional receiver guard.
// The instance read uses the held list and evaluates its argument only when present.
let realm;
realm = globalThis.window;
export const value = realm?.window.self.list.at(index());