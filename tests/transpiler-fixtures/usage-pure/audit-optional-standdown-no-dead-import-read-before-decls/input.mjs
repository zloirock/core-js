// declaration ORDER does not break the proof: the closure reads aliases declared after it -
// a legal call still sees the assigned globals, and an early call throws the same TDZ
// ReferenceError raw or guarded (faithful-throw)
export function readBeforeDecls() {
  return laterAlias.window?.self?.Promise;
}
const laterG = globalThis;
const laterAlias = laterG;
