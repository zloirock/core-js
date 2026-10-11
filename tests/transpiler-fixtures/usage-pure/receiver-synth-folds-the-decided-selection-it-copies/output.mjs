import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// a parameter's receiver synth spells the value it replaces again: a selection the build decides folds in
// that copy as in the value itself - under a collapsed `||` default and in an argument the synth reads
export function viaOr({
  from
} = (setup(1), {
  from: _Array$from
})) {
  return from;
}
export function viaCall({
  at
} = {
  at: _at(make(1))
}) {
  return at;
}
export const viaArgument = (({
  flat
}) => flat)({
  flat: _flatMaybeArray(make(1))
});