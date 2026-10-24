import _Array$from from "@core-js/pure/actual/array/from";
// a CHAINED fallback (`globalThis || self || window`) collapses left-to-leftmost: the whole
// chain is replaced by the mirrored literal - every alias short-circuits identically
function f({
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
}) {
  return from;
}
export { f };