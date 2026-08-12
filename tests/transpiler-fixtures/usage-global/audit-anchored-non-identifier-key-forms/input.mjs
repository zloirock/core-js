// the ctor-key anchor route is a usage-pure rewrite, so tightening its key gate to identifier-valid
// names must leave this method's decision alone: every key shape below - folded well-known symbol,
// dashed and dotted strings, `$` and Unicode identifiers, a real constructor - still contributes its
// own detection, and the source is not rewritten at all
const { [Symbol.iterator]: { name: iterName } } = globalThis;
const { 'App-Key': { assign } } = globalThis;
const { [`A.b`]: { flat } } = globalThis.window?.self;
const { A$b: { from } } = globalThis;
const { Abé: { token } } = globalThis;
const { Map: { groupBy } } = globalThis;
console.log(iterName, assign, flat, from, token, groupBy);
