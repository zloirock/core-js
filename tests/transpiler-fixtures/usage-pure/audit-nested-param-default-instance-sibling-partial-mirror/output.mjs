import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// a sibling leaf is a set-method exposed as a STATIC on the PURE constructor (`_Set.union`),
// even though `Set.union` is NOT a declared static and is `undefined` on a native Set. reading
// it off globalThis must INJECT the pure constructor (`Set: { union }` -> `Set: _Set`), and
// `Array.from` mirrors its own import. value diverges from native, so it's fixture-locked
function f({
  Array: {
    from
  },
  Set: {
    union
  }
} = {
  Array: {
    from: _Array$from
  },
  Set: {
    union: _Set.union
  }
}) {
  return [from, union];
}
f();