// TS type-annotation walker shares the same path-threading contract as the value-side
// JSXIdentifier visitor: a hoisted `var Name` in a nested non-function block shadows the
// global at type-position too (TypeScript treats value-position bindings as type-positions
// when no separate type binding exists). Without the path, the var-scope fallback misses
// the shadow and the plugin emits the Set polyfill chain on a type that resolves locally.
function f(cond: boolean) {
  if (cond) {
    var Set = function () {
      return null;
    };
  }
  let s: Set;
  return s;
}