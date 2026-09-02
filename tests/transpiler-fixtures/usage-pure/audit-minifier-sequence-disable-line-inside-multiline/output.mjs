import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// a line-bound opt-out INSIDE a multi-line minifier sequence covers the product on its own line
// and nothing else: each split product keeps its operand's own position, so the directive the
// author wrote beside the destructure holds after the split while the sibling operand on the
// other line still injects; the prefix-line twin pins the boundary from the other side
const arr = [1, [2]];
let at, flat;
eff();
// core-js-disable-next-line
({
  at
} = arr);
// core-js-disable-line
use(at);
// core-js-disable-next-line
eff2();
flat = _flatMaybeArray(arr);
use(flat);