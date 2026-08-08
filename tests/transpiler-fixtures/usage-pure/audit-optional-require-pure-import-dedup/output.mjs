// an OPTIONAL require of a pure entry (`require?.(...)`, which CJS parsers wrap in a ChainExpression)
// must be recognised as an already-provided pure import, exactly like a plain `require(...)`. here the
// user pre-requires the Promise constructor entry the plugin itself would inject for `new Promise`;
// the re-scan peels the transparent wrapper before the type gate, so the substitution REUSES the
// bound name (`new Foo`) instead of emitting a second import of the very same module
var Foo = require?.("@core-js/pure/actual/promise/constructor");
export const p = new Foo(resolve => resolve());
module.exports = {
  p
};