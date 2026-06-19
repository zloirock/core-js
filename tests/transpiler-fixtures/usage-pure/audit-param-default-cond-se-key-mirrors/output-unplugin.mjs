import _Array$from from "@core-js/pure/actual/array/from";
// the diverging SE-key mirror reaches the PARAMETER-DEFAULT host too (the AssignmentPattern right side
// is the receiver): the proxy branch mirrors to a synth literal under the resolved static key, the
// user-object branch stays native (no corruption), the effect stays in the residual LHS and runs once.
// distinct host from the declarator - it routes through the parameter-destructure path, not the gate
const userObj = { Array: {} };
function f({ Array: { [(eff(), "from")]: from } } = cond ? { Array: { from: _Array$from } } : userObj) {
  return from;
}
