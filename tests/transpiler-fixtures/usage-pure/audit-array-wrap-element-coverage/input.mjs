// An array wrapper all of whose elements are claimed leaves whole, each extraction repeating its own
// element's coercion; an element no claim reads, a surviving binding or a rest keeps the wrapper and
// reads each element once. The untouched first statement keeps this comment at the top of the output.
const anchor = [1, 2];
export { anchor };

// every element claimed: the wrapper binds nothing observable and leaves whole, each extraction
// repeating the coercion its own element performed
const [{ at }, { keys }] = [a, b];
export { at, keys };

// NEGATIVE: an element the claim never touched still COERCES its value (`{}` over a nullish `x`
// throws), and no extraction repeats that - the wrapper stays
const [{}, { at: at2 }] = [x, arr];
export { at2 };

// The surviving binding reads before the following extraction. Its emptied trailing element
// leaves the residual: downstream destructuring lowering can otherwise lose the binding.
const [{ other }, { at: at3 }] = [x, arr];
export { other, at3 };

// a REST element keeps the wrapper whatever the claim takes, so the residual reads the element a
// second time: a selection that ran once must not re-select, and both legs share one `_ref`
const [{ at: at4 }, ...rest] = [c ? a : x, 1];
export { at4, rest };

// NEGATIVE: a static reads its slot's constructor, not the element's value, so it replaces no
// coercion: the wrapper stays and each slot hands over a literal
const [{ from }, { of }] = [Array, Array];
export { from, of };
