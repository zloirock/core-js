import _Symbol from "@core-js/pure/actual/symbol/constructor";
// a NESTED assignment-form binding also bails
let deep;
({
  constructor: {
    iterator: deep
  }
} = _Symbol);
export const viaNestedAssign = [9][deep];