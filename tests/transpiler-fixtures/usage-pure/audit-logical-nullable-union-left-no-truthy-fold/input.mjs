// `r: number[] | null` union fold strips the null arm, but the runtime value may still be
// nullish, so `??` / `||` may yield the RIGHT operand: the always-truthy fold must not
// collapse to Array (generic dispatch). `&&` still folds to the right (nullish left
// short-circuits to a nullish result, throwing either way), and a same-family right
// keeps the Array narrow via the common-type merge; a non-nullable left still folds
declare const r: number[] | null;
declare const arr: string[];
(r ?? 'fallback').at(0);
(r || 'fallback').includes('f');
(r && 'tail').at(1);
(arr ?? 'x').includes('y');
