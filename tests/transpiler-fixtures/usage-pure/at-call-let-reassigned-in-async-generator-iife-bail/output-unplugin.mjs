import _at from "@core-js/pure/actual/instance/at";
let x = [];
(async function*() { x = 'hello'; })();
_at(x).call(x, -1);