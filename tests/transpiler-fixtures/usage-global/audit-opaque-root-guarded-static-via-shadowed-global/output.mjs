import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// NEGATIVE: a binding SHADOWING the global name (a parameter) keeps the raw identifier - the
// buried-global proof and the substitution both respect scope
function shadowWrap(globalThis) {
  return (x => x)(globalThis)?.window?.self?.Array.of(28).at(0);
}
export const viaShadowedGlobal = shadowWrap;