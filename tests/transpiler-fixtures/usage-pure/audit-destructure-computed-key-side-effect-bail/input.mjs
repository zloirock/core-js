// computed destructure key whose prefix has a side effect (`[(eff(), "from")]`), resolving to a
// polyfillable static. the static rewrite is bailed - the side effect cannot be carried through the
// destructure path - so the key is left intact and the effect preserved; only the unrelated array
// method on the next line polyfills
const { [(effectful(), "from")]: f } = Array;
const doubled = [1, [2]].flat();
