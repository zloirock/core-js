import _Array$of from "@core-js/pure/actual/array/of";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
const o = _Array$of;
// extraction statements follow the props' SOURCE order even though the symbol extraction is
// registered at a later phase than the static one (the receiver copy waits for composed
// text): a `[Symbol.iterator]` binding written before a static sibling extracts first
const [{
  [_Symbol$iterator]: it,
  of: _unused,
  ...r
}] = [Array];
it;
o(1);
r;