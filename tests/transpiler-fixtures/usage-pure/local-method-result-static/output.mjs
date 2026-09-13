import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A fixed local method returns a constructor. Only the selected static is required;
// the method call and its effects remain at the original read position.
const source = {
  read() {
    effect();
    return _Map;
  }
};
export const method = (source.read(), _Map$groupBy);