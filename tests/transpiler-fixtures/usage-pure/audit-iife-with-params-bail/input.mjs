// IIFE whose param is a DESTRUCTURE pattern can't be statically arg-matched, so inline-call
// resolution bails and the live call survives. a single-Identifier identity param (`(x) => x`)
// IS inlined now - only non-trackable param shapes keep the receiver behind the call
const a = (({ Map }) => Map)(WeakMap).has(1);
// fn-expression IIFE with an array-destructured param equally bails
const b = (function ([Set]) { return Set; })(WeakSet).has(1);
export { a, b };
