// a CHAINED fallback (`globalThis || self || window`) collapses left-to-leftmost: the whole
// chain is replaced by the mirrored literal - every alias short-circuits identically
function f({ Array: { from } } = globalThis || self || window) {
  return from;
}
export { f };
