import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// The optional reader can take the fallback. Its ordinary twin throws before it.
export const {
  from: optional
} = (null == _globalThis.window ? void 0 : {
  from: _Array$from
}) ?? {};
export const plain = ((null == _globalThis.window ? void 0 : _self).Array.from, _Array$from);