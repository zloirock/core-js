import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// A sole-key object hop pairs with the slot it names, like an array wrapper with its element.
// Pure getters may collapse; effectful getters keep their reads and use the actual slot's identity
// to select the ponyfill. A later spread or unknown key keeps the runtime override in that choice.
// A constructor escaping through the getter includes its static methods.
const other = {};
// a NUMERIC key names a slot like any other, and a write to it keeps the level whole all the same
const holder = {
  0: _globalThis
};
holder[0] = other;
const {
    0: _ref
  } = holder,
  keptByWrite = _ref === _globalThis ? _Promise : _ref.Promise;
let underOptional = other;
export default [keptByWrite];