import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Parameters<typeof fn>[i] where fn has only a rest param: `(...args: number[][])`.
// findTupleElement Parameters branch: i=0, isRest=true, so calls extractElementAnnotation(annotation, scope, 0)
// to peel one level (T[] -> T). Result should be number[], so .at(0) dispatches to Array.
declare function fn(...args: number[][]): void;
type ArgZero = Parameters<typeof fn>[0];
declare const a: ArgZero;
_atMaybeArray(a).call(a, 0);