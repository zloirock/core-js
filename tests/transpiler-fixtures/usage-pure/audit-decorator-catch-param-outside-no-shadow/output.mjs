import _Map from "@core-js/pure/actual/map/constructor";
// catch-param binds ONLY inside the catch body, so a sibling reference outside the
// catch (`new Map()` after the try/catch) must still emit the polyfill. The
// decorator-walk frame scope must NOT flat-collect catch params as fn-level locals.
@(function () {
  try {} catch (Map) {}
  return new _Map();
})
class C {}
[C];