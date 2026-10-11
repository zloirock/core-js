import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
// a constructor written through bindings aliasing member paths that lead back to a name already aliased - two
// aliasing each other, and one off its own name - is read back through each path a strictly shorter key path at
// a time, so the transform ends
var a = b.x;
var b = a.y;
a.C = _Iterator;
export const copied = b.x.C.from([1]);
const root = {
  child: {
    next: {
      C: Object
    }
  }
};
var node = root.child;
var node = node.next;
node.C = _Map;
export const grouped = root.child.next.C.groupBy([1], x => x);