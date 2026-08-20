// `namespace Map.Y {}` (no `declare`) lowers to a runtime IIFE that binds the LEFTMOST segment
// `Map`, shadowing the global. babel@8 parses the id as a single TSQualifiedName (v7 nested it);
// the plugin must read the leftmost segment to see the shadow and leave `new Map()` un-polyfilled
namespace Map.Y {
  export const z = 1;
}
const a = new Map();
export { a };
