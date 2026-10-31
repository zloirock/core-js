// A captured selection keeps the user's value, its own undefined and key order.
function declared(flag, shim) {
  let held;
  const { Array: { [(trace('key'), 'from')]: from = fallback(), ...rest } }
    = held = flag ? globalThis : shim;
  return [held, from, rest];
}
function assigned(shim) {
  let held, of;
  ({ Array: { [(trace('key'), 'of')]: of = fallback() } } = held = shim ?? globalThis);
  return [held, of];
}
