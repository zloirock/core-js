// A member living in a parenthesized branch of an intersection must resolve through the
// peeled type, not bail on the parenthesized wrapper.
interface A { a: number; }
interface B { items: number[]; }
declare const v: A & (B);
v.items.at(-1);
