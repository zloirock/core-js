// a PLAIN nav and an optional one side by side in one receiver. the plain one is collapsed by the
// accepted proxy-alias assumption while the optional one keeps its guard, so the two differ by
// exactly one token - and a composition that located the guard's slot leniently put its render on
// the plain sibling. the sequence TAIL is collapsed by the receiver render itself, so the channel
// that would claim its ponyfillable hop must stand down with it
globalThis.siblingBox = { list: ['ab', 'cd'] };
export const plainFirst = (globalThis.window.self.siblingBox.list, globalThis.window?.self.siblingBox.list)?.at(0);
export const optionalFirst = (globalThis.window?.self.siblingBox.list, globalThis.window.self.siblingBox.list)?.at(0);
export const bothPlain = (globalThis.window.self.siblingBox.list, globalThis.window.self.siblingBox.list)?.at(0);
export const bothOptional = (globalThis.window?.self.siblingBox?.list, globalThis.window?.self.siblingBox.list)?.at(0);
export const prefixedPlainFirst = ('x', globalThis.window.self.siblingBox.list, globalThis.window?.self.siblingBox.list)?.at(0);
export const mixedTailOptional = (globalThis.window.self.siblingBox?.list, globalThis.window?.self.siblingBox.list)?.at(0);

// the SOURCE already spells the shape a render emits, so a slot search can meet its own output
// coming the other way. the hand-written guard is user code and must survive untouched
export const handWrittenGuardFirst = (null == globalThis.window ? void 0 : globalThis.self.siblingBox.list,
  globalThis.window?.self.siblingBox.list)?.at(0);
export const handWrittenGuardSecond = (globalThis.window?.self.siblingBox.list,
  null == globalThis.window ? void 0 : globalThis.self.siblingBox.list)?.at(0);
export const tripleRepeat = (globalThis.window?.self.siblingBox.list, globalThis.window?.self.siblingBox.list,
  globalThis.window?.self.siblingBox.list)?.at(0);

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.siblingBox.list ? 0 : 1)?.includes('a');
