import _Array$of from "@core-js/pure/actual/array/of";
// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  var list = Array;
  return (({
    of
  } = Object) => of(3))({
    of: _Array$of
  });
})();