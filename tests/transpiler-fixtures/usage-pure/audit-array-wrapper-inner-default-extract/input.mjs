// Inner default `from = []` is dead code under polyfill-always-wins: the extracted
// polyfill binding is always defined, so the user's fallback never fires. the extraction
// binds the polyfill and keeps the default as the flat twin's static guard
const wrapper = [Array];
const [{ from = [] }] = wrapper;
from([1, 2]);
