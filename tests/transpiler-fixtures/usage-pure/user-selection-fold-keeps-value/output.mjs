import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A fold keeps the VALUE the selection yielded: where the selection is a callee or a tag, a `delete`
// or a `typeof` operand, the member it folds to would bind `this` or delete the property, and a bare
// name would stop throwing, so it folds as `(0, operand)` - an inner selection an outer fold puts
// there too; a substituted import needs no wrapper.
export const called = (0, obj.method)(1);
export const tagged = (0, obj.tag)`x`;
export const removed = delete (0, obj.prop);
export const removedName = delete (0, maybeDeclared);
export const probed = typeof (0, maybeDeclared);
export const resolved = _Promise$resolve(1);
export const nestedCalled = (0, obj.method)(1);
export const nestedRemoved = delete (0, obj.prop);