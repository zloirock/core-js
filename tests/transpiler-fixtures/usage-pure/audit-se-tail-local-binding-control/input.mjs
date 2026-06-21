// control for the SE-tail substitution: when the tail is a LOCAL binding (not a proxy-
// global), the in-scope check rejects it and the SE-tail branch emits verbatim.
// receiver text stays as-is, no `_X` import.
const arr = [1, 2];
(0, arr).flat?.(0);
