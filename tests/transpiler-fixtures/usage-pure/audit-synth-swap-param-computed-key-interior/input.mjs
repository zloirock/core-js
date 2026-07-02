// const-Identifier COMPUTED key in the MIDDLE of a param-default destructure (`{ from, [k]: z, of }`,
// k='z'). synth-object parity: `= Array` becomes `{ from: _Array$from, [k]: Array[k], of: _Array$of }`,
// preserving property order around the computed key
const k = "z";
function f({ from, [k]: z, of } = Array) { return [from, of, z]; }
f();
