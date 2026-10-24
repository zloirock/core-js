// An unproven global key prevents a parameter mirror. Every call uses the default,
// so the named statics extract into the body while the key stays in the pattern.
function f({ from, [Set]: y, of } = Array) {
  return [from, of, y];
}
f();
