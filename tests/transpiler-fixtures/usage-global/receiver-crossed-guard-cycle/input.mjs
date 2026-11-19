// Mutually guarded writes keep the same decision whichever alias is queried first.
let a = Array;
let b = Map;
let c = Promise;
if (!b) if (!c) a = other;
if (!a) b = another;
if (!b) c = last;
export const result = a.from([7]);
