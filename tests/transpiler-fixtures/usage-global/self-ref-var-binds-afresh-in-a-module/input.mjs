// `var X = X` binds afresh in every host a pass of ours emits for - a module's top level, a CommonJS
// wrapper's, any function body - so the initializer reads the name's own hoisted `undefined`, names
// no global, and neither the declaration nor a later read of it injects. one global per position so a
// resurrected injection shows in the import set: a bare declaration, a STATIC call off the shadowed
// name (the member channel has to decline with the identifier lane - one source may not be read as
// two hosts), a function body and an arrow. the last row is the control - a name the file never
// shadows, which still injects
var Iterator = Iterator;
var Map = Map;
Map.groupBy([1], x => x);
export function inAFunction() { var Set = Set; return Set; }
export const inAnArrow = () => { var WeakMap = WeakMap; return WeakMap; };
export const control = Promise.try(() => 1);
export { Iterator };
