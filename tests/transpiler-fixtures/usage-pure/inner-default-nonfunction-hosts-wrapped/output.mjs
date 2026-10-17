import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set";
export const wrapped = (() => {
  const [{
    Set: WS,
    'with-dash': wd,
    Array: {
      of: wof
    }
  } = {
    Set: _Set,
    "with-dash": _globalThis["with-dash"],
    Array: {
      of: _Array$of
    }
  }] = [];
  const [{
    Array: {
      of: wonly
    }
  } = {
    Array: {
      of: _Array$of
    }
  }] = [];
  return [WS, wd, wof, wonly];
})();