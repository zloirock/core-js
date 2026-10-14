// A `delete` whose target is a realm navigation folds it whole: the member it names is never read, and
// a `?.` reading off a hop below the `window` probe tests nothing, so no guard is built and the slot is
// reached off the realm's ponyfill - sealed or not, with a `?.` or without one. No row reads a
// constructor another deletes: a deleted realm slot holds that name native for the whole file.
export const guardedTarget = delete (globalThis.window.self?.Promise);
export const guardedTargetSealed = delete ((globalThis.window).self?.Promise);
// NEGATIVE: no environment probe under the `?.` - the connector is dead and the nav collapses plain
export const noProbe = delete (globalThis.self?.WeakSet);
// NEGATIVE: no `?.` at all - the whole navigation erases and the slot reads off the pure root
export const noOptional = delete (globalThis.window.self.WeakMap);
