// A mutated built-in static / prototype method / proxy-global constructor pins the polyfill entry of
// the mutated key for pristine-init (so core-js modules loading later in the bundle initialize from the
// pristine value, not the replacement). When the file ALSO imports that exact pure entry directly, the
// pre-pass registers the user import BEFORE enriching the mutated key, so the pinned entry dedups to the
// existing binding instead of emitting a duplicate import. Three branches, three distinct entries:
// static method, prototype method, proxy-global constructor replacement.
import _gb from "@core-js/pure/actual/map/group-by";
import _at from "@core-js/pure/actual/array/instance/at";
import _wm from "@core-js/pure/actual/weak-map/constructor";

Map.groupBy = () => {};
Array.prototype.at = () => {};
globalThis.WeakMap = function () {};

export { _gb, _at, _wm };
