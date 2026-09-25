import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _at from "@core-js/pure/actual/instance/at";
// The positional route renames the claimed array slot and reads it after the pattern binds. A slot
// AFTER the claim's that reads or evaluates when the pattern binds - a nested pattern, a default,
// a rest that destructures - would then run before the claim's own read, where native reads the
// claim's level first; those keep the pattern native. A bare binding, a plain rest and a reader
// BEFORE the claim keep the rename.
const seen = [];
const mk = () => ({
  get y() {
    _pushMaybeArray(seen).call(seen, 'y');
    return [7, 8];
  }
});
const box = {
  get z() {
    _pushMaybeArray(seen).call(seen, 'z');
    return 2;
  }
};
const pair = [mk(), box];
const solo = [mk()];
const [{
  y: {
    at: a1
  }
}, {
  z: z1
}] = pair;
const [{
  y: {
    at: a2
  }
}, t2 = _pushMaybeArray(seen).call(seen, 'd')] = solo;
const [{
  y: {
    at: a3
  }
}, ...[{
  z: z3
}]] = pair;
const [_ref, t4] = pair;
const a4 = _atMaybeArray(_ref.y);
const [_ref2, ...r5] = pair;
const a5 = _atMaybeArray(_ref2.y);
const [{
  z: z6
}, _ref3] = _sliceMaybeArray(pair).call(pair).reverse();
const a6 = _at(_ref3.y);
let a7, z7;
[{
  y: {
    at: a7
  }
}, {
  z: z7
}] = pair;
export { a1, z1, a2, t2, a3, z3, a4, t4, a5, r5, a6, z6, a7, z7, seen };