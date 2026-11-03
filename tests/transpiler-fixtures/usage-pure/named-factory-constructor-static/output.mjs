import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A named factory retains the ordinary indirect-call extraction.
// It is not classified as a transparent literal wrapper.
function make() {
  return {
    C: _Map
  };
}
const {
  C: {
    groupBy
  }
} = (make(), {
  C: {
    groupBy: _Map$groupBy
  }
});
export const r = typeof groupBy;