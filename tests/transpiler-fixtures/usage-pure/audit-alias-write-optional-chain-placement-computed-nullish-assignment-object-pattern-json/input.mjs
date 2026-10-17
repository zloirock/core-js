// a logical object is still an unconditionally-reached spine: both arms lead to the member
// access, so the key always evaluates - static narrow
let JK;
(a ?? b)[({ JSON: JK } = globalThis)].c;
