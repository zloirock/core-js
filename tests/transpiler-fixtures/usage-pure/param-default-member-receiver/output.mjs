import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a destructured parameter whose receiver default is a MEMBER of the file's own container - a class
// static field, a pure static getter, a literal's data slot - takes the static: pure mirrors the
// default on both legs, since the read of a pure member is no work the source did, and the mirror
// keeps a caller-supplied object; global injects the static
class Fields {
  static M = _Map;
}
class Getters {
  static get P() {
    return _Promise;
  }
}
const data = {
  I: _Iterator
};
export function viaField({
  groupBy
} = {
  groupBy: _Map$groupBy
}) {
  return groupBy;
}
export function viaGetter({
  try: attempt
} = {
  try: _Promise$try
}) {
  return attempt;
}
export function viaData({
  from
} = {
  from: _Iterator$from
}) {
  return from;
}
// ... and a caller that supplies its own object still reads its own slot
export const supplied = viaData({
  from: 1
});