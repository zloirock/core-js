import _from from "@core-js/pure/actual/array/from";
// An empty argument element selects the nested default. Keep native parameter reads
// inside the iterator; the static binding is served before the original body runs.
function f([{
  from,
  [(effect(), 'unknown')]: x
} = Array]) {
  from = _from;
  return [from, x];
}
f([void 0]);