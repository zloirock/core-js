import "core-js/modules/es.math.hypot";
// NEGATIVE: a destructured binding holds a SLOT of its init, never the container - the alias
// union must not fan the container's values. `cbrt` is a STATIC-only key no other row injects,
// so the row injects `es.math.cbrt` exactly when the walk smuggles the container `Math`
const {
  hypot: extracted
} = Math;
let holder2 = extracted;
holder2 = Object;
export const containerNotSmuggled = holder2.cbrt;