import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
// Each array element is captured once in iteration order before its instance method is read.
// Unclaimed elements, rest and static-only neighbours retain their native patterns.
const anchor = [1, 2];
export { anchor };
a;
b;
// Every element is claimed: each source receiver is selected once, then each method is read from
// the corresponding selected value.
const at = _at(a);
const keys = _keys(b);
export { at, keys };

// NEGATIVE: an element the claim never touched retains its native empty-object coercion, so a
// nullish `x` throws. Both source receiver expressions are still evaluated once.
const [{}, {}] = [x, arr];
const at2 = _at(arr);
export { at2 };

// The surviving binding reads from the first selected value before the following method read.
// The native residual retains that binding when the claimed trailing element is extracted.
const [{
  other
}] = [x, arr];
const at3 = _at(arr);
export { other, at3 };

// A REST element retains the native residual for coercion and rest collection. The conditional
// source receiver is selected once; the method read and residual use that selected value in order.
const _ref = c ? a : x;
const at4 = _at(_ref);
const [{}, ...rest] = [_ref, 1];
export { at4, rest };

// NEGATIVE: a static reads its slot's constructor, not an instance receiver, so native wrapper
// coercion remains and each slot receives the corresponding constructor value.
const [{
  from
}, {
  of
}] = [Array, Array];
export { from, of };