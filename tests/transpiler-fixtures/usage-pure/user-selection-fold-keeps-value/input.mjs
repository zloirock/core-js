// A fold keeps the VALUE the selection yielded: where the selection is a callee or a tag, a `delete`
// or a `typeof` operand, the member it folds to would bind `this` or delete the property, and a bare
// name would stop throwing, so it folds as `(0, operand)` - an inner selection an outer fold puts
// there too; a substituted import needs no wrapper.
export const called = (typeof Promise !== 'undefined' && obj.method)(1);
export const tagged = (typeof Symbol === 'function' ? obj.tag : Iterator.from)`x`;
export const removed = delete (typeof Map === 'undefined' ? WeakSet.prototype.x : obj.prop);
export const removedName = delete (typeof Promise !== 'undefined' ? maybeDeclared : Set);
export const probed = typeof (typeof Promise !== 'undefined' ? maybeDeclared : WeakMap);
export const resolved = (typeof Promise !== 'undefined' ? Promise.resolve : fallback)(1);
export const nestedCalled = (typeof Promise !== 'undefined' ? (typeof Symbol === 'function' ? obj.method : URL) : queueMicrotask)(1);
export const nestedRemoved = delete (typeof Map === 'undefined' ? DOMException.prototype.x : (typeof Promise !== 'undefined' ? obj.prop : DisposableStack.prototype.y));
