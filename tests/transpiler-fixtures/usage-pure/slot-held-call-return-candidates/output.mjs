import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _URL from "@core-js/pure/actual/url";
import _URL$canParse from "@core-js/pure/actual/url/can-parse";
// A call may return its default constructor or select it in the body.
// An ensuing static read needs the method on the resulting constructor.
function withDefault(M = _Map) {
  return M;
}
function withArm(P) {
  return P || _Promise;
}
function url(U = _URL) {
  return U;
}
const list = [withDefault()];
export const grouped = _Map$groupBy([1], x => x);
export const attempted = {
  P: withArm()
}.P.try(() => 1);
export const parses = typeof (url(), _URL$canParse);