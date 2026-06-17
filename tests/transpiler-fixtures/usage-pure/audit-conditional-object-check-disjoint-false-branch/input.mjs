// A conditional type whose CHECK side is a non-primitive (an array) extending a primitive extend side:
// an object type can never extend a primitive, so the check is disjoint and the FALSE branch (number[])
// is selected. The multi-type includes then narrows that false-branch type to array and injects the
// array variant - proving the object-check-side disjoint rule drove the branch pick.
type R<T> = T extends string ? never : number[];
declare const v: R<number[]>;
const r = v.includes(0);
export { r };
