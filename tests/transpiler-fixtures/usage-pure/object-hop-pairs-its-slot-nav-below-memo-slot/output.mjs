import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
// Navigation below a captured slot uses that slot's Array.prototype surface.
// Initializer effects retain their source order, two leaves share the surface, and
// assignment preserves sibling bindings and initializer effects.
function navBelowMemoSlot(hit) {
  const _ref = {
    z: (hit(), 1),
    w: (hit(), _globalThis)
  };
  const navInSlot = _atMaybeArray(_ref.w.Array.prototype);
  const {
    z: nz
  } = _ref;
  const _ref2 = {
    w: (hit(), _globalThis),
    y: 2
  };
  const navHoist = _atMaybeArray(_ref2.w.Array.prototype);
  const {
    y: ny
  } = _ref2;
  const _ref4 = {
      x: (hit(), 3),
      w: (hit(), _globalThis)
    },
    {
      w: {
        Array: {
          prototype: _ref3
        }
      }
    } = _ref4,
    navTwinAt = _atMaybeArray(_ref3),
    navTwinFlat = _flatMaybeArray(_ref3),
    {
      x: nx
    } = _ref4;
  let navAssign, na, navAssignAlone, navAssignEffect, ne;
  ({
    a: na
  } = {
    w: _globalThis,
    a: 4
  });
  navAssign = _atMaybeArray(_globalThis.Array.prototype);
  navAssignAlone = _atMaybeArray(_globalThis.Array.prototype);
  ({
    e: ne
  } = {
    e: (hit(), 5),
    w: (hit(), _globalThis)
  });
  navAssignEffect = _atMaybeArray(_globalThis.Array.prototype);
  return [navInSlot, nz, navHoist, ny, navTwinAt, navTwinFlat, nx, navAssign, na, navAssignAlone, navAssignEffect, ne];
}
export default [navBelowMemoSlot(() => 0)];