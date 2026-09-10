import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
// every spelling that reaches the ONE proxy-global surface hands out the same constructor, so an
// escape through any of them widens the entry alike: a redundant proxy hop, an alias of the
// surface, a zero-arg IIFE returning it, and a container slot holding it - in a value position and
// as an extends base, whose subclass reads a static only the widened entry installs
const g = _globalThis;
const ns = {
  g: _globalThis
};
hand(_Map);
hand(_Set);
hand(_WeakMap);
export class Sub extends _Promise {}
use(Sub.try);