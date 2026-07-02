// IIFE body has a ForStatement (loop body may early-return Map) before the tail return.
// receiver resolution must bail on ForStatement: a scan that only sees the tail return
// would emit the wrong polyfill. outer call stays raw; inner Map / Set constructors still
// polyfill per-identifier
const out = (() => { for (let i = 0; i < 1; i++) return Map; return Set; })().of(1);
export { out };
