import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
// Each live logical operand keeps its own substitution under a left the build does not serve (`Map`, its
// constructor entry excluded, while `groupBy` keeps its own): a realm member lands on the backed proxy root,
// a constructor operand on its pure constructor. The selection is evaluated once for the polyfilled
// property and the copy of the remaining keys.
const g = _globalThis;
const groupBy = _Map$groupBy;
const {
  groupBy: _unused,
  ...others
} = _self.Map || _Set;
groupBy(list, key);