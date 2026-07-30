import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// static-container reads resolve through the same canon the destructure receivers use:
// a class STATIC field is a container, duplicate literal keys read the LAST (live) value,
// and a deep object inside a class static walks hop by hop - for a MEMBER read as much as for a
// destructure, which is the point: both sides ask the same walk. a flat destructure over the
// container member extracts the pure static directly (polyfill-always-wins, like the nested
// spelling); constructors substitute to the pure ponyfill; the dead duplicate stays native
class NS {
  static M = _Map;
}
const groupBy = _Map$groupBy;
groupBy(items, fn);
const ND = {
  M: Array,
  M: _Iterator
};
const from = _Iterator$from;
from(y);
class NS2 {
  static a = {
    P: _Promise
  };
}
export const r = _Promise$try(fn);