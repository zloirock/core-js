import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// An alias retains the optional source guard when supplying a flat parameter.
const held = _globalThis.window?.Array;
export const result = (({
  from
}) => from)(null == held ? void 0 : {
  from: _Array$from
});