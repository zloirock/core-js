import _includes from "@core-js/pure/actual/instance/includes";
// A later inert default does not prevent instance extraction.
export function read(_ref, options = {
  xs: [1, -2, null]
}) {
  let includes = _includes(_ref);
  return [includes, options];
}