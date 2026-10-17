// a NESTED assignment-form binding also bails
let deep;
({ constructor: { iterator: deep } } = Symbol);
export const viaNestedAssign = [9][deep];
