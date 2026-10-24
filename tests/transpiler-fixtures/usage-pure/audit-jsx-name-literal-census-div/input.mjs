// Constructor defaults with rest use the full index; supplied objects keep their properties.
// Other static extractions require closed callers; key/default effects remain independent.
function div({ values, ...rest } = Object) {
  return [values, rest];
}
