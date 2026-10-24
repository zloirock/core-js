import _Map from "@core-js/pure/actual/map";
// A write to a nested own data slot replaces the constructor before destructuring.
// Peeling the outer pattern must retain that write; Object.groupBy is unreachable.
const holder = {
  part: {
    value: Object
  }
};
holder.part.value = _Map;
export const {
  part: {
    value: {
      groupBy
    }
  }
} = holder;