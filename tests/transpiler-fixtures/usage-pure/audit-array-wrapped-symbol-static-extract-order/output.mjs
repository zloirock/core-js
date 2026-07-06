import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
const it = _getIteratorMethod(Array);
const o = _Array$of;
// extraction statements follow the props' SOURCE order even though the symbol extraction is
// registered at a later phase than the static one (the receiver copy waits for composed
// text): a `[Symbol.iterator]` binding written before a static sibling extracts first
const [{
  [_Symbol$iterator]: _unused,
  of: _unused2,
  ...r
}] = [Array];
it;
o(1);
r;