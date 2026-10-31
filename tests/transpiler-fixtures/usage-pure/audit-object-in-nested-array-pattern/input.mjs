// Shared capture and receiver-default routes preserve independently supported claims.
// Native iteration, source effects and residual bindings stay in order.
function f([[{ from } = Array]]) {
  return from([1]);
}
f([[Array]]);
