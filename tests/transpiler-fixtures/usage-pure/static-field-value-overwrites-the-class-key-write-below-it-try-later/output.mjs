import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
let C = _Iterator;
class InstanceFieldOverKey {
  held = C = Array;
  [(C = _Promise, 'c')] = 1;
}
export const tryLater = () => (C === _Promise ? _Promise$try : C.try.bind(C))(() => 1);