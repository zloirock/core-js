// `namespace Map.Y {}` binds the leftmost segment `Map` at runtime, shadowing the global. its id is
// a TSQualifiedName on babel@8; the plugin reads the leftmost segment to see the shadow and inject
// NO `es.map` side-effect for the shadowed `new Map()`
namespace Map.Y {
  export const z = 1;
}
const a = new Map();
export { a };