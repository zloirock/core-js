// A locally body-extracted binding (`const from = ...`, emitted when the plugin lowers an earlier
// shorthand destructure) is a stable in-scope value, NOT a plugin-injected pure reference. Using
// it as a computed key must not bail the sibling synth: the receiver still mirrors `[from]` and
// polyfills the shorthand `of` (`= { [from]: Array[from], of: _Array$of }`). Guards against an
// over-broad identity check that would treat any plugin-known name as injected
const { from } = Array;

export function pick({ [from]: own, of } = Array) {
  return [own, of([1]), from([2])];
}
