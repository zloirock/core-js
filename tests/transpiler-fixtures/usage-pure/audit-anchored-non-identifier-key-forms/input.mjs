// a single-property pattern takes the ctor-key ANCHOR route only when its key can be spelled as a
// bare member tail. a computed key folds to an arbitrary string, so a capitalised NON-identifier
// ('Symbol.iterator', 'App-Key', `A.b`) has to stay a residual read - splicing it after a dot
// aborts the build on one emitter and reads a different property on the other
const { [Symbol.iterator]: { name: iterName } } = globalThis;
const { 'App-Key': { assign } } = globalThis;
const { [`A.b`]: { flat } } = globalThis.window?.self;
// identifier-valid capitalised keys still anchor - `$` and the Unicode continue classes are
// identifier characters, so the gate is validity, not an ASCII word test
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
