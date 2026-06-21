import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a multi-hop proxy receiver carrying a buried computed-key side effect, reached via an ALIAS root and
// via OPTIONAL chaining. the unplugin cannot collapse a computed hop in text (the hop's key holds the
// effect), so it drops the discarded receiver and re-emits ONLY the harvested side effect - avoiding a
// read of an undefined intermediate hop (`_globalThis.self`) off-browser. babel restructures the AST
// instead, so the receiver survives there (cosmetic divergence, both run the effect once). distinct
// methods so each line's injected import is unambiguous
let aliasReads = 0;
let optionalReads = 0;
const root = _globalThis;
function viaAlias({
  of
} = (aliasReads++, {
  of: _Array$of
})) {
  return of;
}
function viaOptional({
  from
} = (optionalReads++, {
  from: _Array$from
})) {
  return from;
}
export { viaAlias, viaOptional };