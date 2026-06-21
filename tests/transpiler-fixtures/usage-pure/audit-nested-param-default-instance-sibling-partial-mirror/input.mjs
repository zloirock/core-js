// a sibling leaf is a set-method exposed as a STATIC on the PURE constructor (`_Set.union`),
// even though `Set.union` is NOT a declared static and is `undefined` on a native Set. reading
// it off globalThis must INJECT the pure constructor (`Set: { union }` -> `Set: _Set`), and
// `Array.from` mirrors its own import. value diverges from native, so it's fixture-locked
function f({ Array: { from }, Set: { union } } = globalThis) {
  return [from, union];
}
f();
