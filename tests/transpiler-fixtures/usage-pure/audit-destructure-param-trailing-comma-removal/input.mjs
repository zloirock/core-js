// these shapes SYNTH their receiver: the caller-correct literal is preferred over editing the
// pattern, so no prop is removed. what they lock is that a trailing comma does not push the
// pattern off the synth path
(function ({ 'from': f, }) {
  return f;
})(globalThis.Array);
(function ({ 'from': f, 'of': o, }) {
  return [f, o];
})(globalThis.Array);
// a block comment between the sole prop and its trailing comma stays behind the prop
(function ({ 'of': o /* keep me out */, }) {
  return o;
})(globalThis.Array);
