import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// A sole-key object hop pairs with the slot it names, like an array wrapper with its element.
// Pure getters may collapse; effectful getters keep their reads and use the actual slot's identity
// to select the ponyfill. A later spread or unknown key keeps the runtime override in that choice.
// A constructor escaping through the getter includes its static methods.
const other = {};
// An optional write may not run: that uncertain alias requires the actual slot's identity before
// selecting a constructor. A block-scoped shadow can change a var initializer's value: the later
// `var` write reaches the read with the shadow's value, and a non-realm value keeps its own
// property result.
const maybeNull = null;
let underOptional = other;
maybeNull?.[underOptional = _globalThis];
({
  w: underOptional
});
const noClaimUnderOptionalWrite = underOptional === _globalThis ? _Map : underOptional.Map;
export default [noClaimUnderOptionalWrite];