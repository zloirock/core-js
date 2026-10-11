// in usage-global no synth copies the value: a parameter pattern's leaf loads what its receiver may hold
// - `from` off the served left of the `||` default, `at` for every family off a call-result default and
// `flat` off the call result an IIFE passes - and the decided selections inside load only the `Symbol`
// their tests read
export function viaOr({ from } = (setup(typeof Symbol != 'undefined' ? 1 : 2), Array) || Object) {
  return from;
}
export function viaCall({ at } = make(typeof Symbol != 'undefined' ? 1 : 2)) {
  return at;
}
export const viaArgument = (({ flat }) => flat)(make(typeof Symbol != 'undefined' ? 1 : 2));
