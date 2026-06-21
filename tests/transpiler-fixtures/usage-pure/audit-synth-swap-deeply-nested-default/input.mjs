// inner ObjectPattern inside an outer ObjectPattern.Property.value, with its own
// AssignmentPattern receiver: `function f({inner: {from} = Array} = {})`. the param-default
// walk must climb ObjectProperty.value + ObjectPattern up to the function-like owner and
// land on the inner pattern's parent (AssignmentPattern with right=Array), so synth-swap
// targets the INNER default, not the outer `= {}`.
function f({ inner: { from } = Array } = {}) {
  return from([1]);
}
f();
