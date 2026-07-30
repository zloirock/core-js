// these shapes now SYNTH their receiver: the caller-correct literal is preferred over the text
// splice, so no prop is removed and no comma has to be consumed here. what they lock is that a
// trailing comma does not push the pattern off the synth path. the splice and its comma handling
// are exercised where a dynamic computed key makes the literal impossible
(function ({ 'from': f, }) {
  return f;
})(globalThis.Array);
(function ({ 'from': f, 'of': o, }) {
  return [f, o];
})(globalThis.Array);
// a block comment between the sole prop and its trailing comma must not hide the comma from the
// removal scan, or the same orphaned-comma syntax error returns
(function ({ 'of': o /* keep me out */, }) {
  return o;
})(globalThis.Array);
