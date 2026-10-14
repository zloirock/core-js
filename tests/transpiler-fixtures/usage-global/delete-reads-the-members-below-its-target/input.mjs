// A `delete` reads every member below its target on the way there, so those keep their claims: an
// instance method the target hangs off dispatches, on the deepest backed hop whatever the root, and
// a constructor read on the way takes its ponyfill. The target itself is never read: a method it
// names stays native, deleted off the native prototype.
let n = 0;
function dhRoot() { return globalThis; }
export const protoMethodTarget = delete (globalThis.window.self?.Array?.prototype.at);
export const protoMethodPlain = delete (globalThis.self.Array.prototype.includes);
export const seqRootMethodTarget = delete (((n++, globalThis.window)).self?.Array?.prototype.copyWithin);
export const deletedInstanceMember = delete (globalThis.self.Array.prototype.flat.name);
export const instanceTailMemo = delete (globalThis.window.self?.Array?.prototype.flatMap.name);
export const callRootDispatchTail = delete (dhRoot().self.Array.prototype.findLast.customQ);
// ... while a target off the same call root is the realm slot itself, reached off the root
export const callRootRunSlot = delete dhRoot().self.customQ;
export const claimAboveSeqNav = delete (((n++, globalThis.window)).self?.Symbol?.iterator);
export const deletedProto = delete globalThis.Map.prototype.noSuchMethod;
export const deletedProtoNav = delete globalThis.window?.self?.Set.prototype.noSuchMethod;
