// method call on a binding whose whole annotation is a parenthesised union (`(A | B)`):
// the paren wrapper is peeled before alias-chain resolution so the union member's return
// type propagates and the array-specific at variant is selected on the call result
interface A { make(): number[]; }
interface B { make(): number[]; }
declare const x: (A | B);
const r = x.make().at(0);
export { r };
