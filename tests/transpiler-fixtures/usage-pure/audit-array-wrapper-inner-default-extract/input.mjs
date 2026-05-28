// Inner default `from = []` is dead code under polyfill-always-wins: the extracted
// polyfill binding is always defined, so the user's fallback never fires. extraction
// drops the default and emits a flat const binding to the polyfill
const wrapper = [Array];
const [{ from = [] }] = wrapper;
from([1, 2]);
