// Decided operands keep their effects; a user arm keeps its own member.
function selected(other) {
  const { from } = (trace('left'), Array) || other;
  return from;
}
function shared(flag) {
  const { of, length } = flag ? Array : Array;
  return [of, length];
}
function user(flag, shim) {
  const { Array: { [(trace('key'), 'fromAsync')]: fromAsync } } = flag ? globalThis : shim;
  return fromAsync;
}
