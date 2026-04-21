import _at from "@core-js/pure/actual/instance/at";
var _ref;
// mix of `?.(`, `?.[`, `?.prop` in a single chain — exercises deoptionalizeNeedle's
// per-`?.` lookahead for `(` / `[` / prop-name (drops both vs keeps `.`)
null == (_ref = obj?.(key)?.[idx]) ? void 0 : _at(_ref).call(_ref, 0);