import _Promise$all from "@core-js/pure/actual/promise/all";
const arr = [import("a"), import("b")];
_Promise$all(arr).then(x => x);