import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _at from "@core-js/pure/actual/instance/at";
// Native object neighbours share the positional capture and read after earlier claims.
// Later plain bindings and array rest bind after those reads; earlier bindings stay in place.
// A later default or destructuring rest keeps the pattern native.
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
const [_ref, _ref2] = pair;
const a1 = _atMaybeArray(_ref.y);
const {
  z: z1
} = _ref2;
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
const [_ref3, _ref4] = pair;
const a4 = _atMaybeArray(_ref3.y);
const t4 = _ref4;
const [_ref5, ..._ref6] = pair;
const a5 = _atMaybeArray(_ref5.y);
const r5 = _ref6;
const [{
  z: z6
}, _ref7] = _sliceMaybeArray(pair).call(pair).reverse();
const a6 = _at(_ref7.y);
let a7, z7;
[{
  y: {
    at: a7
  }
}, {
  z: z7
}] = pair;
export { a1, z1, a2, t2, a3, z3, a4, t4, a5, r5, a6, z6, a7, z7, seen };