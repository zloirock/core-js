import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Type alias inside a TSModuleBlock scope (`namespace NS { type LocalArr = ... }`).
// distinct scope shape from BlockStatement: babel creates a TSModuleDeclaration scope
// where direct lookup works through `block.body?.body`. unplugin's estree-toolkit does
// NOT create a scope for TSModuleDeclaration, so scope-chain lookup from the use site
// lands at Program scope with no namespace iteration. the resolver must fall back to
// walking the AST path for the enclosing TSModuleBlock body to find LocalArr there.
namespace NS {
  type LocalArr = number[];
  declare const x: LocalArr;
  _atMaybeArray(x).call(x, 0);
}