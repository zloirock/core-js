import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const anchor = [1, 2];
export { anchor };
a;
b;
const at = _at(a);
const keys = _keys(b);
export { at, keys };
const [{}, {}] = [x, arr];
const at2 = _at(arr);
export { at2 };
const [{
  other
}] = [x, arr];
const at3 = _at(arr);
export { other, at3 };
const _ref = c ? a : x;
const at4 = _at(_ref);
const [{}, ...rest] = [_ref, 1];
export { at4, rest };
const [{
  from
}, {
  of
}] = [Array, Array];
export { from, of };