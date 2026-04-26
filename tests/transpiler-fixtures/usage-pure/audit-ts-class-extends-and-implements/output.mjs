import _Map from "@core-js/pure/actual/map/constructor";
// `extends` slot and `implements` list are different parents under the same class -
// `extends` is runtime (polyfilled), each `implements` entry is type-only (skipped).
// multi-implements walks each TSExpressionWithTypeArguments separately
export class A extends _Map<string, number> implements WeakMap<object, number>, Set<string> {}