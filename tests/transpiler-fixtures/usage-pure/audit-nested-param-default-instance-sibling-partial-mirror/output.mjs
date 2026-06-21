import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// a sibling whose leaf is a set-method exposed as a STATIC on the PURE constructor (`_Set.union` is a
// function on `@core-js/pure/.../set/constructor`, even though `Set.union` is NOT declared as a static in
// the built-in definitions and is `undefined` on a native Set). reading it off globalThis must INJECT the
// pure constructor - `Set: { union }` -> `Set: _Set`, so `union` reads `_Set.union` - matching usage-pure's
// own `globalThis.Set.union` -> `_Set.union` resolution. NO native read / optional chaining (modern syntax
// that postdates destructuring). `Array.from` mirrors to its own pure import; the synth default is caller-
// correct. value diverges from a native Set (function vs undefined), so this is fixture-locked not in the
// differential
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