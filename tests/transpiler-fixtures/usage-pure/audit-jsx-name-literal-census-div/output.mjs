import _Object$values from "@core-js/pure/actual/object/values";
// Constructor defaults with rest use the full index; supplied objects keep their properties.
// Other static extractions require closed callers; key/default effects remain independent.
function div({
  values: _unused,
  ...rest
} = Object) {
  let values = _Object$values;
  return [values, rest];
}