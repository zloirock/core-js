globalThis.Set = class PatchedSet extends Set {};
let v;
export const mutatedNameTail = (v = globalThis.window)?.self?.self.Set.name.at?.(0);
