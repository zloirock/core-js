import _Array$from from "@core-js/pure/actual/array/from";
// Inner default `from = []` is dead code under polyfill-always-wins: the extracted
// polyfill binding is always defined, so the user's fallback never fires. the extraction
// binds the polyfill after preserving the array and native property reads.
const wrapper = [Array];
const [_ref] = wrapper;
const {
  from: _unused
} = _ref;
const from = _Array$from;
from([1, 2]);