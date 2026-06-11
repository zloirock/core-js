// static-container reads resolve through the same canon the destructure receivers use:
// a class STATIC field is a container, duplicate literal keys read the LAST (live) value,
// and a deep object inside a class static walks hop by hop. constructors substitute to the
// pure ponyfill (whose own statics carry the methods); the dead duplicate stays native
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
