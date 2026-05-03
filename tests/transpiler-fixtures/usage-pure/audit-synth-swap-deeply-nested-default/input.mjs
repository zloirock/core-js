// inner ObjectPattern inside an outer ObjectPattern.Property.value, with its own
// AssignmentPattern receiver: `function f({inner: {from} = Array} = {})`. The path walk
// `isFunctionParamDestructureParent` traverses ObjectProperty.value + ObjectPattern up to
// the function-like owner; `findTargetPath` is queried on the inner pattern's parent
// (AssignmentPattern with right=Array), so synth-swap targets the inner default
function f({ inner: { from } = Array } = {}) {
  return from([1]);
}
f();
