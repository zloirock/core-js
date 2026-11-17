import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// A used pattern assignment returns the whole realm receiver.
let usedPrototype;
const kept = ({
  prototype: usedPrototype
} = _Map, _globalThis);
use(kept, usedPrototype);