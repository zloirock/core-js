// Literal keys, a key on a call result and a label leave the first temporary available.
function call() { return {}; }
const objKey = { _ref: 1 };
export const r1 = [10, 20].at(0);
call()._ref;
export const r2 = [[1], [2]].flat();
_ref: for (const v of [1, 2]) { if (v) break _ref; }
export const r3 = [3, 4].includes(3);
const importKey = { _Array$from: 1 };
export const r4 = Array.from([5, 6]);
export { objKey, importKey };
