// a call whose callee annotation is a function-type ALIAS: the alias must be followed (carrying any
// generic substitution) before the return type is read, so the receiver resolves to the concrete
// return - a direct alias and a generic one both surface their TSFunctionType (not a bare reference)
type Direct = () => number[];
type Generic<T> = () => T[];
declare const direct: Direct;
declare const generic: Generic<string>;
const a = direct().at(0);
const b = generic().includes('x');
export { a, b };
