// catch-param binds ONLY inside the catch body, so a sibling reference outside the
// catch (`new Map()` after the try/catch) must still emit the polyfill. The
// decorator-walk frame scope must NOT flat-collect catch params as fn-level locals.
@(function () {
  try {} catch (Map) {}
  return new Map();
})
class C {}
[C];
