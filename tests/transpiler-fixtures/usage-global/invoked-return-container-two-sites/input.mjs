// A yielded container is filled per call, so a second call site with another constructor narrows
// neither: each read resolves to its own call's argument and injects that static alone.
function box(v) { return [v]; }
export const first = box(Map)[0].groupBy([1], x => x);
export const second = box(Array)[0].of(2);
