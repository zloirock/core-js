import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// usage-global twin: no receiver is replaced here, so this guards the DETECTION side - props that
// collapse to one slot in the pure emission must each still be seen, and every polyfillable one
// still gets its module injected
const duplicateUnresolvedSlot = function ({
  'z': z1,
  'z': z2,
  from,
  of
} = Array) {
  return [from, of, z1, z2];
}();
// the numeric and string spellings of one slot collapse together too
const numericAndStringSpelling = function ({
  0: a,
  '0': b,
  entries
} = Object) {
  return [a, b, entries];
}();
// when one of the duplicate spellings RESOLVES, the collapsed entry must keep the polyfill rather
// than the passthrough, or the import would be dropped and both bindings would read native
const duplicateResolvedSlot = function ({
  keys: k1,
  'keys': k2
} = Object) {
  return [k1, k2];
}();
// the spellings need not match in kind: a folded computed key names the same slot as a plain one
const foldedSpellingOfSameSlot = function ({
  'values': v1,
  ['val' + 'ues']: v2
} = Object) {
  return [v1, v2];
}();
export { duplicateUnresolvedSlot, numericAndStringSpelling, duplicateResolvedSlot, foldedSpellingOfSameSlot };