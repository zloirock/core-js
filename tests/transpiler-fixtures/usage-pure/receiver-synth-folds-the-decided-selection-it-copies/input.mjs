// a parameter's receiver synth spells the value it replaces again: a selection the build decides folds in
// that copy as in the value itself - under a collapsed `||` default and in an argument the synth reads
export function viaOr({ from } = (setup(typeof Symbol != 'undefined' ? 1 : 2), Array) || Object) {
  return from;
}
export function viaCall({ at } = make(typeof Symbol != 'undefined' ? 1 : 2)) {
  return at;
}
export const viaArgument = (({ flat }) => flat)(make(typeof Symbol != 'undefined' ? 1 : 2));
