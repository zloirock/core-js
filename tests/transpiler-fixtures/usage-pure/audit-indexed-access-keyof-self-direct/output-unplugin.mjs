import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `T[keyof T]` direct - value-union of T's properties. resolveIndexedAccessType folds
// each member's annotation into a union so method dispatch lands on the array variant
declare const v: { a: number[]; b: number[] }[keyof { a: number[]; b: number[] }];
_includesMaybeArray(v).call(v, 1);