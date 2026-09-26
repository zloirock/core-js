// Inner default `from = []` is dead code under polyfill-always-wins: the extracted
// polyfill binding is always defined, so the user's fallback never fires. the extraction
// binds the polyfill after preserving the array and native property reads.
const wrapper = [Array];
const [{ from = [] }] = wrapper;
from([1, 2]);
