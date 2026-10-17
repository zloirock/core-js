var { iterator: selfDeclared } = Symbol;
selfDeclared = selfDeclared;
export const viaDeclaratorSelfAssign = [][selfDeclared];
