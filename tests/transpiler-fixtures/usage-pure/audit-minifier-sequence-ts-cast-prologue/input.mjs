// a minifier-sequence split promotes each operand to its own statement; a leading STRING
// operand at a prologue position would re-parse as a directive ("use strict" flips the file
// strict). the demotion wrap must peel TS casts too - a cast-wrapped string is the same
// string after the TS strip
("use strict" as any, ({ from } = Array), use(from([1, 2])));

// a PLAIN leading string demotes the same way; explicit parens survive the emit and stay
// non-directive without the demotion
("use asm", ({ of: arrOf } = Array), use(arrOf(1, 2)));
(("not strict"), ({ isArray: isArr } = Array), use(isArr(x)));

// parens around the REAL directive string: a paren-flattening parse demotes the bare string
// (safe either way), a paren-preserving emit keeps the parens - neither may surface a bare
// `"use strict";` statement
(("use strict"), ({ keys: objKeys } = Object), use(objKeys(x)));
