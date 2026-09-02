// a minifier-sequence split promotes each EFFECTFUL operand to its own statement; a string
// operand is quiet and leaves no statement at all - cast-wrapped or not, since the cast vanishes
// at the TS strip - so a leading string never reaches a prologue position where it would re-parse
// as a directive ("use strict" flips the file strict). both legs print nothing for it, parens or no
("use strict" as any, ({ from } = Array), use(from([1, 2])));

("use asm", ({ of: arrOf } = Array), use(arrOf(1, 2)));
(("not strict"), ({ isArray: isArr } = Array), use(isArr(x)));

(("use strict"), ({ keys: objKeys } = Object), use(objKeys(x)));
