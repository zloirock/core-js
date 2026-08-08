// `T[keyof T] | null` union: keyof-self folds to value-union (Array), then optional
// chain narrows null branch. resolved Array hint propagates after the typeof guard
declare const v: { a: number[]; b: number[] }[keyof { a: number[]; b: number[] }] | null;
if (v) v.includes(1);
