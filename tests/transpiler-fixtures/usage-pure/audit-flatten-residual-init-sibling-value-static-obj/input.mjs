// A literal namespace keeps its native static from read beside a defaulted residual binding.
// The independent flat call inside that default remains polyfilled.
const wrapper = { ns: Array };
const { ns: { from }, x = [2].flat() } = wrapper;
from([3]);
x;
