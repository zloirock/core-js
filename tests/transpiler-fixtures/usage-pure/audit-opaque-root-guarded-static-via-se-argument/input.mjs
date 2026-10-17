// an SE argument of the collapsed static call evaluates inside the guarded branch, in place
let argCount = 0;
const argSe = () => argCount++;
const sa = () => globalThis;
export const viaSeArgument = sa()?.window?.Array.of(argSe()).at(0);
