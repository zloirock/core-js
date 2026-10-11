import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
// a constructor written through bindings that patterns take off each other's paths, or off their own name,
// is read back through each path a strictly shorter key path at a time, so the transform ends - and the slot
// it lands on keeps the static read back through the path off the literal's own value
var {
  x: a
} = b;
var {
  y: b
} = a;
a.C = _Iterator;
export const copied = b.x.C.from([1]);
const root = {
  next: {
    next: {
      C: Object
    }
  }
};
var {
  next: node
} = root;
var {
  next: node
} = node;
node.C = _Map;
export const grouped = root.next.next.C.groupBy([1], x => x);