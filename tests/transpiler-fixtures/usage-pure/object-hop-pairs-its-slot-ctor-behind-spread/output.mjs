import _Map from "@core-js/pure/actual/map";
// ... and so does a CTOR claim over the same level: the alias binds the ponyfill rather than the
// realm's own name, and the husk keeps the read the spread performs
// (the effect-bearing SIBLING spelling of this row lives in the differential instead: the legs print
// one runtime there in two shapes - husk against sequence prefix - which bytes cannot hold)
function ctorBehindSpread(extra) {
  const {
    w: {
      Map: behindSpread
    }
  } = {
    ...extra,
    w: {
      Map: _Map
    }
  };
  return behindSpread;
}
export default [ctorBehindSpread({})];