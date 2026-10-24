import _Map from "@core-js/pure/actual/map";
// `extends` slot and `implements` list are different parents under the same class -
// `extends` is runtime (polyfilled), each `implements` entry is type-only (skipped).
// multi-implements walks each implements-clause type-args entry separately
// @ts-expect-error an implements clause the class does not satisfy is the shape under test
export class A extends _Map<string, number> implements WeakMap<object, number>, Set<string> {}