// `Object.freeze` / `Object.defineProperty` return their first argument unchanged (returnsArgument),
// so the call result keeps that argument's concrete container type. an ALIASED static call must honor
// this exactly like the direct member call - dropping to the registry's generic 'Object' would lose
// the array narrow and emit the generic instance helper instead of the array-specific one.
const { freeze, defineProperty } = Object;
export const a = freeze([1, 2]).includes(1);
export const b = defineProperty([3, 4], 'x', {}).at(0);
