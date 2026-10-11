import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _URL$canParse from "@core-js/pure/actual/url/can-parse";
// a flat pattern over a selection the build decides reads like that selection's live operand spelled
// alone: as a parameter default (a ternary, an `&&`), a declaration over an `&&`, an assignment whose
// value is used, an arm carrying an effect ahead of its constructor (declared and assigned), and an
// instance method read off it
export function viaParam({
  groupBy
} = {
  groupBy: _Map$groupBy
}) {
  return groupBy;
}
export function viaAndParam({
  withResolvers
} = {
  withResolvers: _Promise$withResolvers
}) {
  return withResolvers;
}
export const fromAsync = _Array$fromAsync;
let entries;
export const viaValue = () => (entries = _Object$entries, Object);
console.log();
export const from = _Iterator$from;
let canParse;
console.log();
canParse = _URL$canParse;
export { entries, canParse };
export const at = _atMaybeArray([]);