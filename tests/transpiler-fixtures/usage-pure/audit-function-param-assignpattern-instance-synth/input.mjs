// instance-method destructure in a function param default (`{ includes } = X`) synths the DEFAULT
// itself: `{ includes: _includes(X) }` - the receiver is read inside the synth literal, so it only
// evaluates when the caller omits the arg (a passed value destructures natively, caller args win).
// an unknown receiver keeps the generic receiver-dispatching helper; a typed one (`= Array.prototype`)
// refines to the receiver-narrowed variant
function fn({ includes } = X) {
  return includes;
}
fn;
