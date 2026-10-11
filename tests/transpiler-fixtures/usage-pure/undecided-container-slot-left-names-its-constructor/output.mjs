import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a `||` left reading a static container's slot that holds a constructor the build does not serve (its
// constructor entry excluded) is not decided, yet it names that constructor as the bare realm read does: the
// claim binds to the left's static and the selection stays for the sibling it still feeds
const box = {
  U: _globalThis.Map
};
export const groupBy = _Map$groupBy;
export const {
  size
} = box.U || Object;