// The detached guard serves the realm global even when a prefix and a store precede the constructor.
let held;
export const value = (prefix(), held = globalThis.window)?.Map.unknown;
const realm = globalThis;
export const fromAlias = (prefix(), (inner(), realm.self))?.Map.unknown;
