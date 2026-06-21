import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Type alias inside a TSModuleBlock scope (`namespace NS { type LocalArr = ... }`).
// unplugin's estree-toolkit creates no scope for TSModuleDeclaration, so scope-chain
// lookup from the use site lands at Program and misses the namespace-local alias. type
// resolution must fall back to walking the enclosing TSModuleBlock body to find LocalArr.
namespace NS {
  type LocalArr = number[];
  declare const x: LocalArr;
  _atMaybeArray(x).call(x, 0);
}