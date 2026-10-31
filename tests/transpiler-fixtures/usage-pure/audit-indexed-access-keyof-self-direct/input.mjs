// `T[keyof T]` direct - value-union of T's properties. indexed-access resolution folds
// each member's annotation into a union so method dispatch lands on the array variant
declare const v: { a: number[]; b: number[] }[keyof { a: number[]; b: number[] }];
v.includes(1);
