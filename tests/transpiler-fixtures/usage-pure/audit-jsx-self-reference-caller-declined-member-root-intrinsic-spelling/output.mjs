// Constructor defaults with rest use the full index; supplied objects keep their properties.
// Other static extractions require closed callers; key/default effects remain independent.
var cond = true;
export const memberRootIntrinsicSpelling = function d({
  fromEntries,
  ...rest
} = Object) {
  return cond ? (cond = false, <d.Sub x={1} />) : [fromEntries([['a', 1]]), rest];
}();