// `extends` slot and `implements` list are different parents under the same class -
// `extends` is runtime (polyfilled), each `implements` entry is type-only (skipped).
// multi-implements walks each TSExpressionWithTypeArguments separately
export class A extends Map<string, number> implements WeakMap<object, number>, Set<string> {}
