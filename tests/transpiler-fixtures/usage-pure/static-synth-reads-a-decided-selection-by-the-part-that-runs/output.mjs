import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a static synth reads a selection the build decides by the part of it that runs: under a `||` left the
// build decides, and in an IIFE argument - with a parameter default or without - as the operand alone:
// the argument it runs wins over the default
export function viaOr({
  from
} = {
  from: _Array$from
}) {
  return from;
}
export function viaAndOr({
  of
} = {
  of: _Array$of
}) {
  return of;
}
export const viaArgument = (({
  groupBy
}) => groupBy)({
  groupBy: _Map$groupBy
});
export const viaArgumentOverDefault = (({
  try: attempt
} = _Promise) => attempt)({
  try: _Promise$try
});