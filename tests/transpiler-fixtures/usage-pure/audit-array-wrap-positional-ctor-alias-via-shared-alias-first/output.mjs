import _globalThis from "@core-js/pure/actual/global-this";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// a shared BOUND proxy alias feeding both elements resolves each slot independently (the walk
// guard is a recursion stack - a completed hop must not poison the sibling's identical init);
// a mutated proxy KEY declines only its own slot, the sibling still narrows
const g = _globalThis;
const [{
  Reflect: RE
}, {
  JSON: JS
}] = [{
  Reflect: _Reflect
}, g];
export const viaSharedAliasFirst = _Reflect$ownKeys(target);