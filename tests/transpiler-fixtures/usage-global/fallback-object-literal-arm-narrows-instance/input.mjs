// An unresolved arm of a selection walked branch by branch owes what its own value dispatches: a plain object
// literal (`{}`) only a plain object's methods (`toString`), not the key's whole instance family (`values`).
export const plain = (({ values } = {}) => values)(globalThis.window?.Object || {});
export const ownMethod = (({ toString }) => toString)(globalThis.window?.Object || {});
