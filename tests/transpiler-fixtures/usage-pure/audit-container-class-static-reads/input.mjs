// static-container reads resolve through the same canon the destructure receivers use:
// a class STATIC field is a container, duplicate literal keys read the LAST (live) value,
// and a deep object inside a class static walks hop by hop - for a MEMBER read as much as for a
// destructure, which is the point: both sides ask the same walk. a flat destructure over the
// container member extracts the pure static directly (polyfill-always-wins, like the nested
// spelling); constructors substitute to the pure ponyfill; the dead duplicate stays native
class NS {
  static M = Map;
}
const { groupBy } = NS.M;
groupBy(items, fn);
const ND = { M: Array, M: Iterator };
const { from } = ND.M;
from(y);
class NS2 {
  static a = { P: Promise };
}
export const r = NS2.a.P.try(fn);
