import _Array$from from "@core-js/pure/actual/array/from";
// Inner default `from = []` is dead code under polyfill-always-wins: the extracted
// polyfill binding is always defined, so the user's fallback never fires. the extraction
// binds the polyfill and keeps the default as the flat twin's static guard
const wrapper = [Array];
const from = _Array$from === void 0 ? [] : _Array$from;
from([1, 2]);