import _Map from "@core-js/pure/actual/map";
// A dominating container write replaces the old source before destructuring.
// The native groupBy read requires the full Map value held by that write.
let rw1 = {
  k: Object
};
rw1 = {
  k: _Map
};
const {
  k: {
    groupBy: viaDominating
  }
} = rw1;
export { viaDominating };