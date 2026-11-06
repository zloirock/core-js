// A sole-key object hop pairs with the slot it names, like an array wrapper with its element.
// Pure getters may collapse; effectful getters keep their reads and use the actual slot's identity
// to select the ponyfill. A later spread or unknown key keeps the runtime override in that choice.
// A constructor escaping through the getter includes its static methods.
const other = {};
// A later unknown key can override the paired slot. Read the actual slot once and select the
// ponyfill only when that value is the realm; declaration and assignment preserve overrides.
function keptByUnnameableKey(key) {
  const { w: { Map: keptDecl } } = { w: globalThis, [key]: other };
  let keptAssign;
  ({ w: { Map: keptAssign } } = { w: globalThis, [key]: other });
  return [keptDecl, keptAssign];
}
let underOptional = other;
export default [keptByUnnameableKey('q')];
