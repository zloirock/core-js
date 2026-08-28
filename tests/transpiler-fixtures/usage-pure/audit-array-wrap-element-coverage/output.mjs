import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
// an untouched leading statement anchors the comments below: every row here is consumed,
// and a removed first statement would carry its leading comment down to the next one
const anchor = [1, 2];
export { anchor };

// every element claimed: the wrapper binds nothing observable and leaves whole, each extraction
// repeating the coercion its own element performed
const at = _at(a);
const keys = _keys(b);
export { at, keys };

// NEGATIVE: an element the claim never touched still COERCES its value (`{}` over a nullish `x`
// throws), and no extraction repeats that - the wrapper stays
const at2 = _at(arr);
const [{}, {}] = [x, arr];
export { at2 };

// NEGATIVE: a surviving binding keeps the wrapper - but the emptied element BEHIND it sheds, since
// no position needs holding at the end and an array pattern whose last element binds nothing is a
// shape the downstream destructuring lowering miscompiles, dropping the surviving binding with it
const at3 = _at(arr);
const [{
  other
}] = [x, arr];
export { other, at3 };

// a REST element keeps the wrapper whatever the claim takes, so the residual reads the element a
// second time: a selection that ran once must not re-select, and both legs share one `_ref`
const _ref = c ? a : x;
const at4 = _at(_ref);
const [{}, ...rest] = [_ref, 1];
export { at4, rest };

// NEGATIVE: a receiver-less STATIC reads nothing, so the residual is the only reader of its
// element's key and keeps its sentinel
const from = _Array$from;
const of = _Array$of;
const [{
  from: _unused
}, {
  of: _unused2
}] = [Array, Array];
export { from, of };