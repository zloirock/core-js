import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
// A realm default supplies its constructor's prototype as the instance receiver.
// Supplied arguments bypass the default and keep their own receiver families and properties.
export const read = (_ref = _globalThis) => {
  let {
      Array: {
        prototype: _ref2
      }
    } = _ref,
    includes = _includes(_ref2),
    flat = _flatMaybeArray(_ref2);
  return [includes, flat];
};