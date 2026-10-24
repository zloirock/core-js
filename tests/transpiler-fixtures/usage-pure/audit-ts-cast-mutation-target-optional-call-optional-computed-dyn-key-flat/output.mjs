import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// ... and the NEGATIVES of that arm, so a later widening cannot swallow them: a member the enum
// does not declare, a plain object property that merely looks like one, an object literal keyed the
// same way, and a dynamic key all name nothing and leave the read raw
declare const dynKey: string;
export const r7 = _flatMaybeArray(arr)?.call(arr)[dynKey](f);