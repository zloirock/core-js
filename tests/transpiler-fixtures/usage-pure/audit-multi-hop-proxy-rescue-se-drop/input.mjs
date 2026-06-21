// a multi-hop proxy receiver carrying a buried computed-key side effect, reached via an ALIAS root and
// via OPTIONAL chaining. unplugin cannot collapse a computed hop in text (its key holds the effect), so
// it drops the discarded receiver and re-emits ONLY the harvested side effect - avoiding a read of an
// undefined intermediate hop off-browser. babel drops it too, so both converge (no sidecar, effect runs
// once). distinct methods so each line's injected import is unambiguous
let aliasReads = 0;
let optionalReads = 0;
const root = globalThis;
function viaAlias({ of } = root[(aliasReads++, 'self')].Array) {
  return of;
}
function viaOptional({ from } = globalThis?.[(optionalReads++, 'self')]?.Array) {
  return from;
}
export { viaAlias, viaOptional };
