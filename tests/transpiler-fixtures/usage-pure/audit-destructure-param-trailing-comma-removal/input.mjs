// a body-extracted param drops its polyfillable prop by text splice; the removal must consume a
// trailing comma too, or the pattern is left as `{ , }` - a syntax error the AST-based twin never
// emits. the sole-prop and fully-consumed-tail shapes are the ones that empty the braces
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
