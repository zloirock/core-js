// an ASSIGNMENT-FORM constructor alias (`({ Symbol: S } = globalThis)`) registers a verified
// write; the consumer chain folds off the hint just like the declarator form on both emitters
let AssignedSymbol;
({ Symbol: AssignedSymbol } = globalThis);
const { iterator: viaAssigned = fb } = AssignedSymbol;
export const y = [39, 40][viaAssigned];
