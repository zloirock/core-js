// A leading unproven global key prevents a mirror just like a trailing one.
// Closed default-only calls allow both statics to extract into the body.
function f({ [Set]: y, from, of } = Array) {
  return [from, of, y];
}
f();
