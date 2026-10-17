import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set";
export const caught = (() => {
  try {
    throw [];
  } catch ([{
    Set: CS,
    'with-dash': cd,
    Array: {
      of: cof
    }
  } = {
    Set: _Set,
    "with-dash": _globalThis["with-dash"],
    Array: {
      of: _Array$of
    }
  }]) {
    return [CS, cd, cof];
  }
})();