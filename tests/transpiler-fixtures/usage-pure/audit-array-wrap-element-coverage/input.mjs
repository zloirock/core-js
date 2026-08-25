// an untouched leading statement anchors the comments below: every row here is consumed,
// and a removed first statement would carry its leading comment down to the next one
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

// NEGATIVE: a surviving binding keeps its element, and with it the wrapper
const [{ other }, { at: at3 }] = [x, arr];
export { other, at3 };

// a REST element keeps the wrapper whatever the claim takes, so the residual reads the element a
// second time: a selection that ran once must not re-select, and both legs share one `_ref`
const [{ at: at4 }, ...rest] = [c ? a : x, 1];
export { at4, rest };

// NEGATIVE: a receiver-less STATIC reads nothing, so the residual is the only reader of its
// element's key and keeps its sentinel
const [{ from }, { of }] = [Array, Array];
export { from, of };
