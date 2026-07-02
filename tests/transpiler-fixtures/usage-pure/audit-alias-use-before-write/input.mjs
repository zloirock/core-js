// a use textually BEFORE its alias write / declaration (an earlier-defined closure body, a
// hoisted-var read) stays RAW even for a TRUSTED registration - a static narrow would un-throw
// a call that runs before the write; uses textually after keep the static narrow (the locked
// decl canon)
let M;
const early = () => typeof M.groupBy;
({ Map: M } = globalThis);
export const r = [early(), typeof M.groupBy];
const hoisted = () => typeof P.try;
var { Promise: P } = globalThis;
export const q = [hoisted(), typeof P.try];
