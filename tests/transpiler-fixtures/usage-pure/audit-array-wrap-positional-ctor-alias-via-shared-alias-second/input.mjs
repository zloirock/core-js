// a shared BOUND proxy alias feeding both elements resolves each slot independently (the walk
// guard is a recursion stack - a completed hop must not poison the sibling's identical init);
// a mutated proxy KEY declines only its own slot, the sibling still narrows
const g = globalThis;
const [{ Reflect: RE }, { JSON: JS }] = [g, g];
export const viaSharedAliasSecond = JS.rawJSON(input);
