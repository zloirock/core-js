import _globalThis from "@core-js/pure/actual/global-this";
// A sole-key object hop pairs with the slot it names, like an array wrapper with its element.
// Pure getters may collapse; effectful getters keep their reads and use the actual slot's identity
// to select the ponyfill. A later spread or unknown key keeps the runtime override in that choice.
// A constructor escaping through the getter includes its static methods.
const other = {};
let underOptional = other;
const outerSrc = _globalThis;
var shadowed = outerSrc;
{
  const outerSrc = other;
  var shadowed = outerSrc;
}
const {
  w: {
    Map: noClaimBehindBlockShadow
  }
} = {
  w: shadowed
};
export default [noClaimBehindBlockShadow];