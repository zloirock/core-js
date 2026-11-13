import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
// A retained read performs the store once, even when the later hop throws.
export function read() {
  let held;
  try {
    const resolve = ((held = _self).window.Promise, _Promise$resolve);
    return [typeof resolve, held === _self];
  } catch (error) {
    return [_nameMaybeFunction(error), held === _self];
  }
}