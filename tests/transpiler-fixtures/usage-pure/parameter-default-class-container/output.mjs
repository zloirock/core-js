import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a nested parameter pattern whose default is a class reads the class's static slot the way it
// reads a literal's
class K {
  static M = _Map;
}
const o = {
  P: _Promise
};
export function viaClass({
  M: {
    groupBy
  }
} = {
  M: {
    groupBy: _Map$groupBy
  }
}) {
  return groupBy;
}
export function viaLiteral({
  P: {
    try: attempt
  }
} = {
  P: {
    try: _Promise$try
  }
}) {
  return attempt;
}