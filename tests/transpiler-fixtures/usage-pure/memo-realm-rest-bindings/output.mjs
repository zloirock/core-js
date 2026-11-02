import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
effect();
// A sequence initializer runs before both the nested static and constructor bind.
// Keeping their keys out of rest does not transfer either binding to another capture.
const trunc = _Math$trunc;
const Local = _Map;
const {
  Math: _unused,
  Map: _unused2,
  ...rest
} = _globalThis;
use(trunc, Local, rest);