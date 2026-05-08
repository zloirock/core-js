// `const wrapper = makeWrapper()` initialises with a call result, not a literal object.
// Static descent must bail; no spurious `Array.from` polyfill should emit for this destructure.
const wrapper = makeWrapper();
const {
  a: {
    from
  }
} = wrapper;
from;