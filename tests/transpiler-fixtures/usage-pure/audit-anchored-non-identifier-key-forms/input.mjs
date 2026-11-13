// Constructor anchors require a known built-in name. Other keys retain their identity:
// real symbols remain symbolic, and instance extraction uses brackets for punctuated strings.
const { [Symbol.iterator]: { name: iterName } } = globalThis;
const { 'App-Key': { assign } } = globalThis;
const { [`A.b`]: { flat } } = globalThis.window?.self;
// an identifier-valid capitalised key (`$` and the Unicode continue classes are identifier
// characters) names no built-in either: a user global is an unknown realm slot and stays nested
const { A$b: { from } } = globalThis;
const { Abé: { token } } = globalThis;
const { Map: { groupBy } } = globalThis;
// the binding host decides the route as much as the key does: an assignment reaches the same anchor
// render as the declaration, while a parameter default goes through the synth-swap mirror and never
// spelled the key after a dot in the first place
let union;
({ 'App-Key': { union } } = globalThis);
function reader({ [Symbol.iterator]: { keys } } = globalThis) {
  return keys;
}
console.log(iterName, assign, flat, from, token, groupBy, union, reader());
