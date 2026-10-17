// An array wrapper selects each claimed element once in native iteration order before reading its method.
// An unclaimed element, a surviving binding or a rest element retains its native coercion or collection.
// The untouched first statement keeps this comment at the top of the output.
const anchor = [1, 2];
export { anchor };

// Every element is claimed: each source receiver is selected once, then each method is read from
// the corresponding selected value.
const [{ at }, { keys }] = [a, b];
export { at, keys };

// NEGATIVE: an element the claim never touched retains its native empty-object coercion, so a
// nullish `x` throws. Both source receiver expressions are still evaluated once.
const [{}, { at: at2 }] = [x, arr];
export { at2 };

// The surviving binding reads from the first selected value before the following method read.
// The native residual retains that binding when the claimed trailing element is extracted.
const [{ other }, { at: at3 }] = [x, arr];
export { other, at3 };

// A REST element retains the native residual for coercion and rest collection. The conditional
// source receiver is selected once; the method read and residual use that selected value in order.
const [{ at: at4 }, ...rest] = [c ? a : x, 1];
export { at4, rest };

// NEGATIVE: a static reads its slot's constructor, not an instance receiver, so native wrapper
// coercion remains and each slot receives the corresponding constructor value.
const [{ from }, { of }] = [Array, Array];
export { from, of };
