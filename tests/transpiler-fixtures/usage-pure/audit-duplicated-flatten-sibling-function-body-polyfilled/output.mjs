import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
// a proxy-global FLATTEN declarator (`{ Array: { from } } = globalThis`) claims the declaration, and a
// SIBLING nested-instance extraction in the same declaration binds as a trailing declarator appended into
// the flatten's render. the cloned receiver carries a FUNCTION value whose body references a polyfillable
// global - it must substitute in the trailing copy AND the kept residual (visitor-driven), not left raw.
const from = _Array$from;
const {
    y: {
      at: _unused
    }
  } = {
    y: [() => _Map]
  },
  m = _atMaybeArray([() => _Map]);
export const r = [from, m];