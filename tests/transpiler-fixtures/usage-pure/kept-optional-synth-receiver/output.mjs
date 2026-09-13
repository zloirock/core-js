import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$values from "@core-js/pure/actual/object/values";
// A kept optional host guards a synthesized argument and its key effects. An unresolved
// sibling uses one memo; prefixes precede the probe, and fallback effects stay conditional.
let hits = 0;
let full;
export const of = (({
  of
} = {}) => of)((null == (full = _globalThis.window) ? void 0 : (hits++, {
  of: _Array$of
})) ?? {});
let partial;
export const from = (({
  from,
  customZ
} = {}) => [from, customZ])(function (_ref) {
  return null == _ref ? void 0 : {
    from: _Array$from,
    customZ: _ref.customZ
  };
}((partial = _globalThis.window)?.[hits++, "Array"]) ?? {});
let prefixed;
export const values = (({
  values
} = {}) => values)((hits += 10, null == (prefixed = _globalThis.window) ? void 0 : (hits++, {
  values: _Object$values
})) || (hits += 100, {}));
export { hits };