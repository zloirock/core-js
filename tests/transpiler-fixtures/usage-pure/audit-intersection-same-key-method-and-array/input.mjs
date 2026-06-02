// the SAME key declared as a method in one constituent and an array property in another
// (`A.val(): number` + `B.val: number[]`) folds to the array member: foldIntersectionTypes demotes
// the Function-typed constituent so a concrete container governs `.at`, narrowing to the array variant
interface A { val(): number }
interface B { val: number[] }
declare const o: A & B;
o.val.at(0);
