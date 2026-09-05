// several pattern props may name ONE runtime slot. that is not a reason to hand the whole pattern to
// the caller-lossy fallback: the synthesized literal carries the slot once - twice would be a
// strict-mode syntax error once downleveled - and every read of it destructures the same value.
// the polyfillable siblings must keep their imports throughout, since a prop the literal cannot fill
// is normal and only becomes MORE common as targets rise and polyfills drop out one by one
const duplicateUnresolvedSlot = (function ({ 'z': z1, 'z': z2, from, of } = Array) {
  return [from, of, z1, z2];
})();
// the numeric and string spellings of one slot collapse together too
const numericAndStringSpelling = (function ({ 0: a, '0': b, entries } = Object) {
  return [a, b, entries];
})();
// when one of the duplicate spellings RESOLVES, the collapsed entry must keep the polyfill rather
// than the passthrough, or the import would be dropped and both bindings would read native
const duplicateResolvedSlot = (function ({ keys: k1, 'keys': k2 } = Object) {
  return [k1, k2];
})();
// the spellings need not match in kind: a folded computed key names the same slot as a plain one
const foldedSpellingOfSameSlot = (function ({ 'values': v1, ['val' + 'ues']: v2 } = Object) {
  return [v1, v2];
})();
// the collapse must not depend on WHICH spelling comes first, and an effect-bearing spelling keeps
// its effect on the pattern either way - the literal only ever carries the resolved name once
let effects = 0;
const effectFirst = (function ({ [(effects++, 'assign')]: a1, assign: a2 } = Object) {
  return [a1, a2];
})();
const effectSecond = (function ({ getOwnPropertyNames: g1, [(effects++, 'getOwnPropertyNames')]: g2 } = Object) {
  return [g1, g2];
})();
// TWO effect-bearing spellings of one slot: both prefixes stay on the pattern and run (native runs
// both), while the literal still carries the resolved slot once
const duplicateSeKeys = (function ({ [(effects++, 'of')]: a, [(effects++, 'of')]: b } = Array) {
  return [a, b];
})();
export {
  duplicateUnresolvedSlot, numericAndStringSpelling, duplicateResolvedSlot, foldedSpellingOfSameSlot,
  effectFirst, effectSecond, duplicateSeKeys, effects,
};
