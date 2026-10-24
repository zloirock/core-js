// Navigation below a captured slot uses that slot's Array.prototype surface.
// Initializer effects retain their source order, two leaves share the surface, and
// assignment preserves sibling bindings and initializer effects.
function navBelowMemoSlot(hit) {
  const { w: { Array: { prototype: { at: navInSlot } } }, z: nz } = { z: (hit(), 1), w: (hit(), globalThis) };
  const { w: { Array: { prototype: { at: navHoist } } }, y: ny } = { w: (hit(), globalThis), y: 2 };
  const { w: { Array: { prototype: { at: navTwinAt, flat: navTwinFlat } } }, x: nx } = { x: (hit(), 3), w: (hit(), globalThis) };
  let navAssign, na, navAssignAlone, navAssignEffect, ne;
  ({ w: { Array: { prototype: { at: navAssign } } }, a: na } = { w: globalThis, a: 4 });
  ({ w: { Array: { prototype: { at: navAssignAlone } } } } = { w: globalThis });
  ({ w: { Array: { prototype: { at: navAssignEffect } } }, e: ne } = { e: (hit(), 5), w: (hit(), globalThis) });
  return [navInSlot, nz, navHoist, ny, navTwinAt, navTwinFlat, nx, navAssign, na, navAssignAlone, navAssignEffect, ne];
}
export default [navBelowMemoSlot(() => 0)];
