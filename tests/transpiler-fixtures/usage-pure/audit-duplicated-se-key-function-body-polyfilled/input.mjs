// DUPLICATED receiver under a side-effect KEY (the residual survives so the key effect runs once): the
// receiver is copied into the extraction AND kept in place. its FUNCTION value's body (an instance call)
// must substitute in both copy and residual, visitor-driven like babel's clone, not left raw.
let log = 0;
const { [(log++, 'includes')]: n } = [() => [3, 4].flat()];
export const out = [n, log];
