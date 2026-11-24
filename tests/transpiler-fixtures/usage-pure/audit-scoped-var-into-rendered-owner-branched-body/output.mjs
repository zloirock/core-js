import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
var _ref3;
// The calls inside the branch keep their own temporaries. The call after the optional
// chain uses a separate module-level temporary, including when window is absent.
export const branchedBody = (() => {
  if (_globalThis) {
    var _ref, _ref2;
    const inner = _padStartMaybeString(_ref = _atMaybeArray(_ref2 = ['ab']).call(_ref2, 0)).call(_ref, 3, '-');
    return inner.length ? _globalThis : null;
  }
  return null;
})()?.window?.JSON.parse('1');
export const outer = _atMaybeArray(_ref3 = [branchedBody]).call(_ref3, 0);