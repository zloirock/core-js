// a `var require` hoisted out of a nested block shadows the CJS `require` for the WHOLE module,
// so the global-proxy require spelling below binds the USER's function, not the module loader -
// the alias must stay opaque and the claim raw on BOTH parsers (estree's name-only scope index
// misses the hoisted shadow without the use-site path reaching the lookup)
if (Math.random() > 2) {
  var require = () => ({});
}
var g = require("core-js/actual/global-this");
export const staysRaw = g.Array.from([1]);

// the destructure twin of the same read consults the same census-gated hint arm - it must
// stay a native destructure of the user's value, never a synth extraction
export const { Array: viaDestructure } = g;
export const destructureStaysRaw = viaDestructure;

// control: the same spelling with NO shadow in scope resolves the proxy and folds
export const wouldFold = globalThis.Array.of(2);
