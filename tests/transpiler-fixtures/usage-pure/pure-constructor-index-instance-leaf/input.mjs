// An imported constructor is a function, so at is not an instance claim.
// Neither the native Promise family nor Array/String methods serve this read.
import P from "@core-js/pure/actual/promise";
const box = { P };
export const at = box.P.at;
