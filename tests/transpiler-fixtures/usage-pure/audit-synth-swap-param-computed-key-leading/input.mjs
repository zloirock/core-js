// const-Identifier COMPUTED key FIRST in a param-default destructure (`{ [k]: z, from, of }`, k='z').
// gets synth-object parity with the plain-key form: the `= Array` receiver becomes a literal
// `{ [k]: Array[k], from: _Array$from, of: _Array$of }` - from/of polyfilled, the unpolyfilled
// computed key falls back to `Array[k]`, and a caller-passed arg is preserved (scoped to no-arg default)
const k = "z";
function f({ [k]: z, from, of } = Array) { return [from, of, z]; }
f();
