import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
effect();
// A constructor before the nested static keeps its original binding through the split.
// The initializer prefix and rest exclusion each run once.
const Local = _Map;
const trunc = _Math$trunc;
const {
  Map: _unused,
  Math: _unused2,
  ...rest
} = _globalThis;
use(trunc, Local, rest);