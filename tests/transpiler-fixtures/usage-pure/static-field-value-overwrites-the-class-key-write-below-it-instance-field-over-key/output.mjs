import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
let C = _Iterator;
class InstanceFieldOverKey {
  held = C = Array;
  [(C = _Promise, 'c')] = 1;
}