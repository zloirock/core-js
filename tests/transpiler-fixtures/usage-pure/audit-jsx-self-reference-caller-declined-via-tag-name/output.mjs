// Constructor defaults with rest use the full index; supplied objects keep their properties.
// Other static extractions require closed callers; key/default effects remain independent.
var cond = true;
export const viaTagName = function F({
  from,
  ...rest
} = Array) {
  return cond ? (cond = false, <F x={1} />) : [from, rest];
}();